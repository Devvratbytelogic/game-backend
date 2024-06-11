import authModels from '../models/authModels.js'
import userOtpModel from '../models/userOtpModels.js';
import bcrypt from 'bcrypt';
import { SendOTP } from './otp.js';
import jwt from "jsonwebtoken";
import Counter from '../models/counterModel.js';


export const signUp = async (req, res) => {
    try {
        const user = new authModels(req.body);
        const validationError = user.validateSync();
        const existingUser = await authModels.findOne({ $or: [{ email: req.body.email }, { mobile_number: req.body.mobile_number }] });
        if (validationError) {
            const errors = {};
            for (const field in validationError.errors) {
                errors[field] = validationError.errors[field].message;
            }
            return res.status(400).json({ status: 400, message: "Validation Error", ...errors });
        }
        else if (existingUser) {
            if (existingUser.email === req.body.email) {
                return res.status(409).json({ status: 409, message: "Email already exists" });
            } else {
                return res.status(409).json({ status: 409, message: "Mobile number already exists" });
            }
        }
        else if (typeof req.body.password !== 'string') {
            return res.status(400).json({ status: 400, message: "Password must be a string" });
        }
        else if (typeof req.body.confirm_password !== 'string') {
            return res.status(400).json({ status: 400, message: "Confirm password must be a string" });
        }
        else if (req.body.password !== req.body.confirm_password) {
            return res.status(400).json({ status: 400, message: "Passwords do not match" });
        } else {
            const sequenceDoc = await Counter.findOneAndUpdate(
                { sequence_name: 'user_id' },
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            const profileImage = req.file ? req.file.path : null;
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            const newUser = new authModels({
                ...req.body,
                password: hashedPassword,
                confirm_password: hashedPassword,
                id: sequenceDoc.sequence_value,
                profileImage: profileImage,
            });
            const OTP = await SendOTP(req.body.email);
            const userOtp = new userOtpModel({
                email: req.body.email,
                otp: OTP
            });
            await userOtp.save();
            await newUser.save();
            res.status(201).json({ status: 201, message: "User created successfully" });
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const userOTP = await userOtpModel.findOne({ email, otp });
        if (!email) {
            return res.status(400).json({ status: 400, message: "Email is required" });
        }
        if (!userOTP) {
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
        await authModels.findOneAndUpdate({ email }, { isVerified: true });
        await userOtpModel.deleteOne({ email, otp });
        res.status(200).json({ status: 200, message: "OTP verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUserOTP = await userOtpModel.findOne({ email });
        if (!existingUserOTP) {
            const OTP = await SendOTP(email);
            const userOtp = new userOtpModel({
                email: email,
                otp: OTP
            });
            await userOtp.save();
        } else {
            const OTP = await SendOTP(email);
            await userOtpModel.findOneAndUpdate({ email }, { otp: OTP });
        }
        res.status(200).json({ status: 200, message: "OTP resent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};
export const signIn = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 400, message: "Request body is empty" });
        }
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ status: 400, message: "Email is required and must be a string" });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ status: 400, message: "Password is required and must be a string" });
        }
        const existingUser = await authModels.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        if (!existingUser.isVerified) {
            return res.status(403).json({ status: 403, message: "Account not verified. Please verify your account first." });
        }
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: 401, message: "Incorrect password" });
        }
        const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ status: 200, message: "Login successful", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
}
export const sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await authModels.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        const OTP = await SendOTP(email);
        await userOtpModel.deleteOne({ email });
        const userOtp = new userOtpModel({
            email,
            otp: OTP
        });
        await userOtp.save();
        res.status(200).json({ status: 200, message: "OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, new_password, confirm_new_password } = req.body;
        const userOTP = await userOtpModel.findOne({ email, otp });
        if (!email) {
            return res.status(400).json({ status: 400, message: "Email is required" });
        }
        if (!userOTP) {
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
        if (!new_password || typeof new_password !== 'string') {
            return res.status(400).json({ status: 400, message: "New password is required" });
        }
        if (!confirm_new_password || typeof new_password !== 'string') {
            return res.status(400).json({ status: 400, message: "confirm New password is required" });
        }
        if (new_password.length <= 6) {
            return res.status(400).json({ status: 400, message: "Password must be greater than 6 characters" });
        }
        if (new_password !== confirm_new_password) {
            return res.status(400).json({ status: 400, message: "Passwords do not match" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);
        await authModels.findOneAndUpdate({ email }, { password: hashedPassword, confirm_password: hashedPassword });
        await userOtpModel.deleteOne({ email, otp });
        res.status(200).json({ status: 200, message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};
export const changePassword = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ status: 400, message: "Request body is empty" });
        }
        const { email, old_password, new_password, confirm_new_password } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ status: 400, message: "Email is required and must be a string" });
        }
        const existingUser = await authModels.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        if (!old_password || typeof old_password !== 'string') {
            return res.status(400).json({ status: 400, message: "Old password is required and must be a string" });
        }
        if (new_password.length <= 6) {
            return res.status(400).json({ status: 400, message: "Password must be greater than 6 characters" });
        }
        if (!new_password || typeof new_password !== 'string') {
            return res.status(400).json({ status: 400, message: "New password is required and must be a string" });
        }
        if (!confirm_new_password || typeof confirm_new_password !== 'string') {
            return res.status(400).json({ status: 400, message: "Confirm new password is required and must be a string" });
        }
        if (new_password !== confirm_new_password) {
            return res.status(400).json({ status: 400, message: "New passwords do not match" });
        }
        const passwordMatch = await bcrypt.compare(old_password, existingUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: 401, message: "Incorrect old password" });
        }
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);
        existingUser.password = hashedNewPassword;
        await existingUser.save();
        res.status(200).json({ status: 200, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};
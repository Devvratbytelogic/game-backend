import mongoose from "mongoose";
import validator from "validator";

const userOtpSchema = new mongoose.Schema({
    email: {
        type: String, unique: true, required: [true, 'Email is required.'], validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid email')
            }
        }
    },
    otp: {
        type: String, required: true
    },
})
const userOtpModel = mongoose.model('userotps', userOtpSchema)
export default userOtpModel;
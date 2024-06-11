import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required.'], trim: true },
    email: {
        type: String, unique: true, required: [true, 'Email is required.'], validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid email')
            }
        }
    },
    profileImage: { type: String },
    password: { type: String, required: [true, 'Password is required.'], minlength: [6, 'Password must be at least 6 characters long.'] },
    confirm_password: { type: String, required: [true, 'Confirm password is required.'] },
    mobile_number: { type: Number, required: [true, 'Mobile number is required.'] },
    isVerified: { type: Boolean, default: false, required: true },
    id: { type: Number }
},)
const UserModel = mongoose.model('user', userSchema)
export default UserModel;
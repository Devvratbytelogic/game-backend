import jwt from "jsonwebtoken";
import authModels from '../models/auth/authModels.js';

export const auth = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = req.get('Authorization').split('Bearer ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await authModels.findById(decoded.userId);
        const check_user = await authModels.findOne({ email });
        if (!user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        if (user._id !== check_user._id) {
            return res.status(401).json({ status: 401, message: "Invalid token" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
};

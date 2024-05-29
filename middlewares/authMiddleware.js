import jwt from "jsonwebtoken";
import authModels from '../models/auth/authModels.js'
export const auth = async (req, res, next) => {
    try {
        const token = req.get('Authorization').split('Bearer ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await authModels.findOne({ email: decoded.email });
        if (!user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
};

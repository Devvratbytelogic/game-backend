import jwt from 'jsonwebtoken';
import authModels from '../models/authModels.js';

export const auth = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = req.get('Authorization').split('Bearer ')[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: 401, message: 'Token expired' });
            }
            return res.status(401).json({ status: 401, message: 'Invalid token' });
        }

        const user = await authModels.findById(decoded.userId);
        const check_user = await authModels.findOne({ email });

        if (!user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        if (user._id.toString() !== check_user._id.toString()) {
            return res.status(401).json({ status: 401, message: "Invalid token" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(500).json({ status: 500, message: err.message });
    }
};

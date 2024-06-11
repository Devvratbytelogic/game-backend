import jwt from "jsonwebtoken";
import authModels from '../models/authModels.js';

export const auth = async (req, res, next) => {
    try {
        const authorization = await req.header('Authorization');
        if (!authorization) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        const token = authorization.replace('Bearer', '').trim();
        let isVerified
        try {
            isVerified = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(401).json({ status: 401, message: "Unauthorized: Invalid token" });
        }
        const user = await authModels.findById(isVerified.userId)
        if (!user || !user._id) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        req.userId = user._id;
        next()
    } catch (err) {
        console.log('&&&',err);
        return res.status(500).json({ status: 500, message: err.message });
    }
};


// export const authorizeUser = async () => {

//     try {
//         const token = authorizationHeader.replace('Bearer', '').trim();
//         const isVerified = jwt.verify(token, process.env.JWT_SECRET);
//         if (user._id.toString() !== targetUserId) {
//             return res.status(401).json({ status: 401, message:"Forbidden: You can only change your own password"});
//         }
//     } catch (err) {
//         return res.status(500).json({ status: 500, message: err.message });
//     }

// };

import authModels from '../models/authModels.js'

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await authModels.find().select('-password -confirm_password');
        res.status(200).json({ status: 200, data: allUsers });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};
import authModels from '../models/authModels.js'

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await authModels.find().select('-password -confirm_password');
        res.status(200).json({ status: 200, data: allUsers });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};
export const getUserProfile = async (req, res) => {
    try {
        const user = await authModels.findById(req.userId).select('-password -confirm_password');
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        res.status(200).json({ status: 200, data: user });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { email, ...updateData } = req.body;
        const existingUser = await authModels.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        if (email && email !== existingUser.email) {
            const emailExists = await authModels.findOne({ email: email });
            if (emailExists) {
                return res.status(400).json({ status: 400, message: 'Email already exists' });
            }
            existingUser.email = email;
        }
        if (req.file) {
            existingUser.profileImage = req.file.path;
        }
        Object.assign(existingUser, updateData);
        await existingUser.save();
        res.status(200).json({ status: 200, message: 'User profile updated successfully', data: existingUser });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};
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

        // Construct full URL for the profile image
        const profileImageUrl = user.profileImage ? `${req.protocol}://${req.get('host')}${user.profileImage}` : null;
        const userData = { ...user.toObject(), profileImage: profileImageUrl };

        res.status(200).json({ status: 200, data: userData });
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
            existingUser.profileImage = `/public/images/${req.file.filename}`;
        }
        Object.assign(existingUser, updateData);
        await existingUser.save();

        const profileImageUrl = `${req.protocol}://${req.get('host')}${existingUser.profileImage}`;
        
        res.status(200).json({ status: 200, message: 'User profile updated successfully', data: { ...existingUser.toObject(), profileImage: profileImageUrl } });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
};
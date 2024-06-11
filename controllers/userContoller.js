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
        const user = new authModels(req.body);
        const validationError = user.validateSync();
        if (validationError) {
            const errors = {};
            for (const field in validationError.errors) {
                errors[field] = validationError.errors[field].message;
            }
            return res.status(400).json({ status: 400, message: "Validation Error", ...errors });
        }
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        Object.assign(user, req.body);
        await user.save();
        res.status(200).json({ status: 200, message: 'User profile updated successfully', data: user });
    } catch (err) {
        res.status(500).json({ status: 500, message: err.message });
    }
}
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    sequence_name: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;

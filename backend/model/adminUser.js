import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password_hash: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['ADMIN', 'GATE_STAFF', 'MANAGER'],
            default: 'GATE_STAFF',
            required: true,
        },
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('AdminUser', adminUserSchema);

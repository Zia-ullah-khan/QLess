import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logo_url: {
            type: String,
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

export default mongoose.model('Store', storeSchema);
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        sku: {
            type: String,
            required: true,
        },
        barcode_value: {
            type: String,
            unique: true,
            sparse: true,
        },
        image_url: {
            type: String,
        },
        description: {
            type: String,
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

// Indexes
productSchema.index({ store_id: 1 });
productSchema.index({ barcode_value: 1 });
productSchema.index({ sku: 1 });

export default mongoose.model('Product', productSchema);
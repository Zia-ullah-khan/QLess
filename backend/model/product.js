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
<<<<<<< HEAD
=======

>>>>>>> fdf174b88fe90107580da7e9bb477c8c235a8e98
productSchema.index({ sku: 1 });

export default mongoose.model('Product', productSchema);
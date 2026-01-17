import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    qty: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    unit_price: {
        type: Number,
        required: true,
    },
    total_price: {
        type: Number,
        required: true,
    },
});

const cartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        items: [cartItemSchema],
        is_active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
cartSchema.index({ user_id: 1, is_active: 1 });

export default mongoose.model('Cart', cartSchema);

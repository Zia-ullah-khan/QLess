import mongoose from 'mongoose';

const transactionItemSchema = new mongoose.Schema(
    {
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true,
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        qty: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        unit_price: {
            type: Number,
            required: true,
        },
        total_price: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate total_price before saving if not provided
transactionItemSchema.pre('save', function (next) {
    if (!this.total_price && this.qty && this.unit_price) {
        this.total_price = this.qty * this.unit_price;
    }
    next();
});

// Indexes
transactionItemSchema.index({ transaction_id: 1 });
transactionItemSchema.index({ product_id: 1 });

export default mongoose.model('TransactionItem', transactionItemSchema);

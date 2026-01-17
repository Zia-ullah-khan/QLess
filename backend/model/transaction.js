import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        total_amount: {
            type: Number,
            required: true,
        },
        subtotal: {
            type: Number,
            required: false,
        },
        tax_amount: {
            type: Number,
            required: false,
        },
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED'],
            default: 'PENDING',
            required: true,
        },
        payment_provider: {
            type: String,
            enum: ['APPLE_PAY', 'GOOGLE_PAY', 'CARD', 'PAYPAL', 'MOCK'],
            required: false,
        },
        payment_reference: {
            type: String,
            required: false,
        },
        payment_intent_id: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
transactionSchema.index({ store_id: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

export default mongoose.model('Transaction', transactionSchema);

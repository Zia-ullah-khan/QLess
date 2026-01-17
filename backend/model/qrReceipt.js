import mongoose from 'mongoose';

const qrReceiptSchema = new mongoose.Schema(
    {
        transaction_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true,
            unique: true,
        },
        qr_token: {
            type: String,
            required: true,
            unique: true,
        },
        qr_image_base64: {
            type: String,
            required: false,
        },
        expires_at: {
            type: Date,
            required: true,
        },
        verified_at: {
            type: Date,
            required: false,
        },
        verified_by: {
            type: String,
            required: false,
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
// Note: qr_token and transaction_id already have unique indexes via unique: true
qrReceiptSchema.index({ expires_at: 1 });

export default mongoose.model('QrReceipt', qrReceiptSchema);

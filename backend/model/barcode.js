import mongoose from 'mongoose';

const barcodeMapSchema = new mongoose.Schema(
    {
        barcode_value: {
            type: String,
            required: true,
            unique: true,
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes

barcodeMapSchema.index({ product_id: 1 });

export default mongoose.model('BarcodeMap', barcodeMapSchema);
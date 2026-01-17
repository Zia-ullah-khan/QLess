import QrReceipt from '../model/qrReceipt.js';
import Transaction from '../model/transaction.js';
import TransactionItem from '../model/transactionItem.js';

// Verify QR code at gate
export const verifyQR = async (req, res) => {
    try {
        const { qrToken } = req.body;

        if (!qrToken) {
            return res.status(400).json({ message: 'QR token is required' });
        }

        const qrReceipt = await QrReceipt.findOne({ qr_token: qrToken })
            .populate({
                path: 'transaction_id',
                populate: [
                    { path: 'store_id', select: 'name logo_url' },
                    { path: 'user_id', select: 'name email' }
                ]
            });

        if (!qrReceipt) {
            return res.status(404).json({ message: 'Invalid QR code' });
        }

        // Check if expired
        if (new Date() > qrReceipt.expires_at) {
            return res.status(400).json({ message: 'QR code has expired' });
        }

        // Check if already verified
        if (qrReceipt.is_verified) {
            return res.status(400).json({
                message: 'QR code already verified',
                verified_at: qrReceipt.verified_at,
                verified_by: qrReceipt.verified_by,
            });
        }

        // Mark as verified
        qrReceipt.is_verified = true;
        qrReceipt.verified_at = new Date();
        qrReceipt.verified_by = req.body.verifiedBy || 'gate_staff';

        await qrReceipt.save();

        // Get transaction items for display
        const items = await TransactionItem.find({ transaction_id: qrReceipt.transaction_id })
            .populate('product_id', 'name price image_url');

        res.json({
            success: true,
            message: 'QR code verified successfully',
            transaction: qrReceipt.transaction_id,
            items,
            verified_at: qrReceipt.verified_at,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get transaction for verification (staff use)
export const getTransactionForVerification = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id)
            .populate('store_id', 'name logo_url')
            .populate('user_id', 'name email phone');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Get items
        const items = await TransactionItem.find({ transaction_id: id })
            .populate('product_id', 'name price image_url sku');

        // Get QR receipt status
        const qrReceipt = await QrReceipt.findOne({ transaction_id: id });

        res.json({
            transaction,
            items,
            qr_status: qrReceipt ? {
                is_verified: qrReceipt.is_verified,
                verified_at: qrReceipt.verified_at,
                verified_by: qrReceipt.verified_by,
                expires_at: qrReceipt.expires_at,
            } : null,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

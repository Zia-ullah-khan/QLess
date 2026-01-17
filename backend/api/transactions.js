import Transaction from '../model/transaction.js';
import TransactionItem from '../model/transactionItem.js';
import QrReceipt from '../model/qrReceipt.js';
import { generateQRForTransaction } from './qr-code.js';
import secrets from 'crypto';

// Get transaction by ID
export const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id)
            .populate('store_id', 'name logo_url')
            .populate('user_id', 'name email');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get transaction items
export const getTransactionItems = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify transaction exists
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const items = await TransactionItem.find({ transaction_id: id })
            .populate('product_id', 'name price image_url sku');

        res.json(items);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get or generate QR code for transaction
export const getTransactionQR = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify transaction exists and is paid
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'PAID') {
            return res.status(400).json({ message: 'QR code only available for paid transactions' });
        }

        // Check if QR receipt already exists
        let qrReceipt = await QrReceipt.findOne({ transaction_id: id });

        if (!qrReceipt) {
            // Generate new QR receipt
            const qrToken = secrets.randomBytes(32).toString('hex');
            const qrCodeDataURL = await generateQRForTransaction(
                id,
                transaction.store_id.toString(),
                0,
                new Date()
            );

            qrReceipt = new QrReceipt({
                transaction_id: id,
                qr_token: qrToken,
                qr_image_base64: qrCodeDataURL,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                is_verified: false,
            });

            await qrReceipt.save();
        }

        res.json({
            qr_token: qrReceipt.qr_token,
            qr_image: qrReceipt.qr_image_base64,
            expires_at: qrReceipt.expires_at,
            is_verified: qrReceipt.is_verified,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

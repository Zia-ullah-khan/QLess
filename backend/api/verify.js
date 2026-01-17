import Transaction from '../model/transaction.js';

export const verifyQRCode = async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ success: false, message: 'No QR data provided' });
        }

        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid QR format' });
        }

        const { transactionId, verified } = parsedData;

        if (!transactionId || !verified) {
            return res.status(400).json({ success: false, message: 'Invalid QR content' });
        }

        // Find transaction
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Check status
        if (transaction.qr_code_status === 'USED') {
            return res.status(400).json({ success: false, message: 'QR Code already used' });
        }

        if (transaction.qr_code_status !== 'VALID') {
            return res.status(400).json({ success: false, message: `QR Code is ${transaction.qr_code_status}` });
        }

        // Check expiration
        if (new Date() > new Date(transaction.qr_code_expires_at)) {
            transaction.qr_code_status = 'EXPIRED';
            await transaction.save();
            return res.status(400).json({ success: false, message: 'QR Code has expired' });
        }

        // Mark as USED
        transaction.qr_code_status = 'USED';
        await transaction.save();

        return res.json({
            success: true,
            message: 'Verified! Doors opening...',
            transaction: {
                amount: transaction.total_amount,
                items: transaction.items?.length || 0,
                date: transaction.createdAt
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
};

import Transaction from '../model/transaction.js';

// Confirm payment for a transaction
export const confirmPayment = async (req, res) => {
    try {
        const { transactionId, paymentIntentId, paymentProvider } = req.body;

        if (!transactionId || !paymentIntentId) {
            return res.status(400).json({ message: 'Transaction ID and payment intent ID are required' });
        }

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === 'PAID') {
            return res.status(400).json({ message: 'Transaction already paid' });
        }

        // Update transaction status
        transaction.status = 'PAID';
        transaction.payment_intent_id = paymentIntentId;
        if (paymentProvider) {
            transaction.payment_provider = paymentProvider;
        }

        await transaction.save();

        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            transaction,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

import Transaction from '../model/transaction.js';
import TransactionItem from '../model/transactionItem.js';
import Product from '../model/product.js';
// import { v4 as uuidv4 } from 'uuid'; // Can use if we need to generate unique IDs, but ObjectId is fine.

export const checkout = async (req, res, next) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const { storeId, items, paymentMethod, totalAmount, userId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in checkout" });
    }

    // 1. Create Transaction
    const transaction = new Transaction({
      store_id: storeId,
      user_id: userId || null, // Optional
      total_amount: totalAmount,
      status: 'PAID', // Assuming successful payment for MVP/Simulation
      payment_provider: paymentMethod ? paymentMethod.toUpperCase() : 'MOCK',
    });

    const savedTransaction = await transaction.save({ session });

    // 2. Create Transaction Items
    const transactionItems = [];
    for (const item of items) {
      // Fetch product to get unit price (security check) or rely on frontend?
      // Better to fetch price from DB to avoid manipulation.
      const product = await Product.findById(item.id).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      transactionItems.push({
        transaction_id: savedTransaction._id,
        product_id: product._id,
        qty: item.quantity,
        unit_price: product.price,
        total_price: product.price * item.quantity
      });
    }

    await TransactionItem.insertMany(transactionItems, { session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Mock QR Code generation (replace with real logic if needed)
    const qrPayload = JSON.stringify({
      transactionId: savedTransaction._id,
      storeId: storeId,
      itemCount: items.length,
      timestamp: new Date(),
      verified: true // In a real flow, this might be false until scanned at gate
    });

    //check the prices of all the items manually and conform that they add up to the total amount if not return 400 error
    const calculatedTotal = transactionItems.reduce((acc, item) => acc + item.total_price, 0);
    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({ message: "Total amount mismatch" });
    }

    res.json({
      success: true,
      transactionId: savedTransaction._id,
      qrCode: qrPayload,
      message: "Payment successful!"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

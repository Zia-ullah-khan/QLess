import Transaction from '../model/transaction.js';
import TransactionItem from '../model/transactionItem.js';
import Product from '../model/product.js';
import Cart from '../model/cart.js';
import Stripe from 'stripe';
import dotenv from 'dotenv'; // Ensure dotenv is used

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const checkout = async (req, res, next) => {
  const session = await Transaction.startSession();
  session.startTransaction();

  try {
    const { storeId, items, paymentMethod, totalAmount, userId, paymentIntentId } = req.body;
    // Use authenticated user ID if available, otherwise fallback (for guest/testing)
    const effectiveUserId = req.user ? req.user._id : (userId || null);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in checkout" });
    }

    let status = 'PENDING';
    let verifiedPayment = false;
    let finalTotalAmount = totalAmount; // Default to request amount if MOCK, but override if Stripe

    // --- 1. RECALCULATE TOTAL FROM DB (Security) ---
    // Fetch products to get real prices
    const itemIds = items.map(i => i.id);
    const products = await Product.find({ _id: { $in: itemIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let calculatedSubtotal = 0;
    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }
      calculatedSubtotal += product.price * item.quantity;
    }

    // Tax 8%
    const calculatedTotal = calculatedSubtotal * 1.08;
    const calculatedTotalCents = Math.round(calculatedTotal * 100);

    // --- 2. VERIFY PAYMENT (Stripe vs Mock) ---
    if (paymentMethod === 'STRIPE_SHEET' || paymentMethod === 'STRIPE') {
      if (!paymentIntentId) {
        throw new Error("Payment Intent ID required for Stripe checkout");
      }

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Verify Amount
        // Allow 1-2 cents difference due to rounding
        if (Math.abs(paymentIntent.amount - calculatedTotalCents) > 5) {
          console.error(`Status Mismatch: Expected ${calculatedTotalCents}, Got ${paymentIntent.amount}`);
          throw new Error("Payment amount mismatch. Potential fraud detected.");
        }

        if (paymentIntent.status === 'succeeded') {
          status = 'PAID';
          verifiedPayment = true;
          finalTotalAmount = paymentIntent.amount / 100; // Store exactly what was paid
          console.log(`[Checkout] Stripe Payment verified: ${paymentIntentId}`);
        } else {
          throw new Error(`Payment verification failed. Status: ${paymentIntent.status}`);
        }
      } catch (stripeError) {
        console.error("Stripe verification error:", stripeError);
        throw stripeError; // Re-throw to abort
      }
    } else {
      // Mock / Test Dev Mode
      console.log(`[Checkout] Processing MOCK payment...`);
      await delay(1000);
      status = 'PAID';
      verifiedPayment = true;
      finalTotalAmount = calculatedTotal; // Use calculated total for mock too
    }

    // --- 3. Create Transaction ---
    const transaction = new Transaction({
      store_id: storeId,
      user_id: effectiveUserId,
      total_amount: finalTotalAmount,
      status: status,
      payment_provider: paymentMethod ? paymentMethod.toUpperCase() : 'MOCK',
      payment_intent_id: paymentIntentId
    });

    const savedTransaction = await transaction.save({ session });

    // --- 3. Create Transaction Items ---
    const transactionItems = [];
    for (const item of items) {
      // Allow using price from request for now, but in production fetch from DB
      transactionItems.push({
        transaction_id: savedTransaction._id,
        product_id: item.id,
        qty: item.quantity,
        unit_price: item.price || 0, // Fallback if not passed
        total_price: (item.price || 0) * item.quantity
      });
    }

    await TransactionItem.insertMany(transactionItems, { session });

    // --- 4. Close User's Cart ---
    if (effectiveUserId && verifiedPayment) {
      await Cart.findOneAndUpdate(
        { user_id: effectiveUserId, is_active: true, store_id: storeId },
        { is_active: false },
        { session }
      );
    }

    // --- 5. Generate and Save QR Code Data ---
    // Only generate QR if PAID
    let qrPayload = null;

    if (verifiedPayment) {
      qrPayload = JSON.stringify({
        transactionId: savedTransaction._id,
        storeId: storeId,
        itemCount: items.length,
        timestamp: new Date(),
        verified: true
      });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes form now

      await Transaction.findByIdAndUpdate(
        savedTransaction._id,
        {
          qr_code_data: qrPayload,
          qr_code_status: 'VALID',
          qr_code_expires_at: expiresAt
        },
        { session }
      );
    }

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: verifiedPayment,
      transactionId: savedTransaction._id,
      qrCode: qrPayload,
      message: verifiedPayment ? "Payment successful" : "Payment Pending/Failed"
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Checkout Failed:", error);
    res.status(500).json({ message: error.message || "Payment processing failed" });
  }
};

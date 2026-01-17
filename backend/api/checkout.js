import connectDB from '../config/database.js';
export const checkout = async (req, res, next) => {
    //frontend wil return
    //{
  //"storeId": "nike",
  //"items": [
    //{ "id": "nike-af1-goretex-vibram", "quantity": 2 },
    //{ "id": "nike-aj1-low-g", "quantity": 1 }
  //],
  //"paymentMethod": "apple_pay",
  //"totalAmount": 491.40
  //}}
  const { storeId, items, paymentMethod, totalAmount } = req.body;
  db = connectDB();
  //search the database for storeID, the items and the ammount of each item and verify total amount
  db.collection('stores').findOne({storeId: storeId}, (err, store) => {
    if (err || !store) {
      return res.status(400).json({success: false, message: "Store not found"});
    }
    let calculatedTotal = 0;
    for (let item of items) {
      let storeItem = store.inventory.find(i => i.id === item.id);
      if (!storeItem || storeItem.price * item.quantity !== item.totalPrice) {
        return res.status(400).json({success: false, message: "Item verification failed"});
      }
      calculatedTotal += storeItem.price * item.quantity;
    }
    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({success: false, message: "Total amount mismatch"});
    }
  });
  //generate QR code logic here
  //for now just return a mock QR code string
  //we need to return
  //{
  //"success": true,
  //"transactionId": "TXN-1737012345-ABC123XYZ",
  //"qrCode": "{\"transactionId\":\"TXN-1737012345-ABC123XYZ\",\"storeId\":\"nike\",\"itemCount\":3,\"timestamp\":\"2026-01-17T12:00:00.000Z\",\"verified\":true}",
  //"message": "Payment successful!"
//}
    res.json({success: true,
              transactionId: "TXN-1737012345-ABC123XYZ",
              qrCode: "{\"transactionId\":\"TXN-1737012345-ABC123XYZ\",\"storeId\":\"nike\",\"itemCount\":3,\"timestamp\":\"2026-01-17T12:00:00.000Z\",\"verified\":true}",
              message: "Payment successful!"});
}
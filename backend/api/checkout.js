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
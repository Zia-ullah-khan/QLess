import mongoose from 'mongoose';
export const scanBarcode = async (req, res, next) => {
  const { barcode, storeid } = req.body;
  //search database for barcode and storeid for now lets just return random values and simualte database call
  //mockDatabaseCall(barcode, storeid, res);
  //expected {
  //"id": "nike-af1-goretex-vibram",
  //"name": "Air Force 1 GORE-TEX Vibram",
  //"price": 150.00,
  //"barcode": "2990000000019",
  //"image": "nike-af1-goretex-vibram"
 //}
  res.json({id: "nike-af1-goretex-vibram",
            name: "Air Force 1 GORE-TEX Vibram",
            price: 150.00,
            barcode: "2990000000019",
            image: "nike-af1-goretex-vibram"});
};
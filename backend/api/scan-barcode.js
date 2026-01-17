import Product from '../model/product.js';

export const scanBarcode = async (req, res, next) => {
  try {
    const { barcode, storeid } = req.body;

    if (!barcode) {
      return res.status(400).json({ message: "Barcode is required" });
    }

    // Find product by barcode
    // Note: Assuming barcode_value is unique. 
    // If strict store filtering is meant to happen, we could add { store_id: storeid } 
    // but the schema says barcode_value is unique global or sparse.
    const product = await Product.findOne({ barcode_value: barcode });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
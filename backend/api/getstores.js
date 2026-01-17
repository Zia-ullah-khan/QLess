import storeSchema from '../model/store.js';
export const getStores = async (req, res, next) => {
  try {
    const stores = await storeSchema.find({ is_active: true, is_deleted: false });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
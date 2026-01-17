import Store from '../model/store.js';
import Product from '../model/product.js';

// Get all active stores
export const getStores = async (req, res) => {
    try {
        const stores = await Store.find({ is_active: true, is_deleted: false });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single store by ID
export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findById(id);

        if (!store || store.is_deleted) {
            return res.status(404).json({ message: 'Store not found' });
        }

        res.json(store);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get all products for a specific store
export const getStoreProducts = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify store exists
        const store = await Store.findById(id);
        if (!store || store.is_deleted) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Get all active products for this store
        const products = await Product.find({
            store_id: id,
            is_active: true,
            is_deleted: false,
        }).populate('store_id', 'name logo_url');

        res.json(products);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

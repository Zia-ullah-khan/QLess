import Store from '../model/store.js';
import Product from '../model/product.js';

import User from '../model/user.js';
import jwt from 'jsonwebtoken';

// Admin login (must be admin)
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (!user.isAdmin) {
                return res.status(403).json({ message: 'Access denied: not an admin' });
            }
            const token = jwt.sign({ id: user._id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '30d' });
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: true,
                token,
            });
        }
        return res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Create a new store (admin only)
export const createStore = async (req, res) => {
    try {
        const { name, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Store name is required' });
        }

        const store = new Store({
            name,
            logo_url: logo_url || null,
            is_active: true,
            is_deleted: false,
        });

        await store.save();

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            store,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new product (admin only)
export const createProduct = async (req, res) => {
    try {
        const { storeId, name, price, sku, barcode_value, image_url, description } = req.body;

        if (!storeId || !name || !price || !sku) {
            return res.status(400).json({
                message: 'Store ID, name, price, and SKU are required',
            });
        }

        // Verify store exists
        const store = await Store.findById(storeId);
        if (!store || store.is_deleted) {
            return res.status(404).json({ message: 'Store not found' });
        }

        const product = new Product({
            store_id: storeId,
            name,
            price,
            sku,
            barcode_value: barcode_value || null,
            image_url: image_url || null,
            description: description || null,
            is_active: true,
            is_deleted: false,
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        // Handle duplicate barcode error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Barcode already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update a product (admin only)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating certain fields
        delete updates._id;
        delete updates.createdAt;
        delete updates.updatedAt;

        const product = await Product.findById(id);

        if (!product || product.is_deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        Object.keys(updates).forEach((key) => {
            product[key] = updates[key];
        });

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Barcode already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete a product (soft delete, admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product || product.is_deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Soft delete
        product.is_deleted = true;
        product.is_active = false;

        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

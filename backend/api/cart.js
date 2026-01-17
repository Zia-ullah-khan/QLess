import Cart from '../model/cart.js';
import Product from '../model/product.js';

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity, storeId } = req.body;
        const userId = req.user._id;

        if (!productId || !quantity || !storeId) {
            return res.status(400).json({ message: 'Product ID, quantity, and store ID are required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product || product.is_deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if product belongs to the specified store
        if (product.store_id.toString() !== storeId) {
            return res.status(400).json({ message: 'Product does not belong to this store' });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ user_id: userId, is_active: true });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                user_id: userId,
                store_id: storeId,
                items: [],
            });
        } else {
            // Check if cart is for the same store
            if (cart.store_id.toString() !== storeId) {
                return res.status(400).json({
                    message: 'Cannot add items from different stores. Please checkout or clear your current cart first.',
                });
            }
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product_id.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].qty += quantity;
            cart.items[existingItemIndex].total_price =
                cart.items[existingItemIndex].qty * product.price;
        } else {
            // Add new item
            cart.items.push({
                product_id: productId,
                qty: quantity,
                unit_price: product.price,
                total_price: product.price * quantity,
            });
        }

        await cart.save();
        await cart.populate('items.product_id', 'name price image_url');

        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user_id: userId, is_active: true })
            .populate('store_id', 'name logo_url')
            .populate('items.product_id', 'name price image_url sku');

        if (!cart) {
            return res.json({ items: [], store_id: null });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'Product ID and quantity are required' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ user_id: userId, is_active: true });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product_id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update quantity and total price
        cart.items[itemIndex].qty = quantity;
        cart.items[itemIndex].total_price = cart.items[itemIndex].unit_price * quantity;

        await cart.save();
        await cart.populate('items.product_id', 'name price image_url');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete item from cart
export const deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const cart = await Cart.findOne({ user_id: userId, is_active: true });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product_id.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();
        await cart.populate('items.product_id', 'name price image_url');

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

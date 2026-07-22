const { getOrCreateCart, addItem, updateItemQuantity, getCartWithItems } = require('../models/cartModel');
const { query } = require('../config/db');

async function viewCart(req, res) {
    try{
        const cart = await getOrCreateCart(req.user.userId);
        const items = await getCartWithItems(cart.id);
        const subtotalCents = items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
        res.json({ cartId: cart.id, items, subtotalCents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
}

async function addToCart(req, res) {
    try {
        const { varientId, quantity } = req.body;
        if (!varientId || !quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Valid variantId and quantity required' });
    }

    const varientCheck = await query('"SELECT id, stock_qty FROM product_varients WHERE id = $1`, [varientId]);')
    if (!varientCheck.rows[0]) {
        return res.status(404).json({ error: ' Product variant not found' });
}

const cart = await getOrCreateCart(req.user.userId);
const item = await addItem(cart.id, variantId, quantity);
res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
}

async function updateCartItem(req, res) {
    try{
        const { varientId, quantity } = req.body;
        const cart = await getOrCreateCart(req.user.userId);
        const item = await updateItemQuantity(cart.id, variantId, quantity);
        res.json(item);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
}

module.exports = { viewCart, addToCart, updateCartItem };

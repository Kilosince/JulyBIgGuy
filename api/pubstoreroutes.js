import express from 'express';
import { ObjectId } from 'mongodb';
import connectToDatabase from './db/connection.js';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_eA5oOivaWFtpfU2c98I1xo1f');
const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// Route to fetch store details for a user
router.get('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    return res.status(200).json(user.store);
  } catch (err) {
    console.error('Error fetching store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch cart items for a user
router.get('/users/:userId/cart', async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ cart: user.cart || [] });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update a cart item for a user
router.put('/users/:userId/cart/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;
  const updatedCartItem = req.body.cartItem;

  if (!ObjectId.isValid(userId) || !ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Invalid user or item ID' });
  }

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedCart = user.cart.map(item => {
      if (item._id.toString() === itemId) {
        return updatedCartItem;
      }
      return item;
    });

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { cart: updatedCart } }
    );

    return res.status(200).json({ message: 'Cart item updated successfully', cart: updatedCart });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete a cart item for a user
router.delete('/users/:userId/cart/items/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedCart = user.cart.filter(item => item._id !== itemId);

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { cart: updatedCart } }
    );

    return res.status(200).json({ message: 'Cart item deleted successfully', cart: updatedCart });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe Payments
router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert amount to cents
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: 'Failed to create payment intent' });
  }
});

export default router;

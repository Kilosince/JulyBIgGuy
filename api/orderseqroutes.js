import express from 'express';
import { ObjectId } from 'mongodb';
import connectToDatabase from './db/connection.js';
import { sendPurchaseEmail }  from './src/emailService.js';
import axios from 'axios'; // Import axios

const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// Route to add an item to the cart with foodId
router.post('/users/:userId/cart', async (req, res) => {
  const { userId } = req.params;
  const { item } = req.body;

  try {
    const collection = await getCollection();

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the store item to get the foodId
    const storeIdParts = item.storeId.split('-');
    const storeOwnerId = storeIdParts[0];
    const storeOwner = await collection.findOne({ _id: new ObjectId(storeOwnerId) });

    if (storeOwner && storeOwner.store && storeOwner.store.items) {
      const storeItem = storeOwner.store.items.find(storeItem => storeItem.title === item.itemName);
      if (storeItem) {
        item.foodId = storeItem._id; // Set foodId to the store item's _id
      }
    }

    const cartItem = {
      ...item,
      _id: '_' + Math.random().toString(36).substr(2, 9) // Generate a random string for cart _id
    };

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { cart: cartItem } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send('Failed to add item to cart');
    }

    res.status(200).send('Item added to cart successfully');
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to update store item quantity
router.put('/stores/:storeId/items/:itemId/quantity', async (req, res) => {
  const { storeId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const collection = await getCollection();
    const storeOwnerId = storeId.split('-')[0]; // Extract the user _id from storeId

    const storeOwner = await collection.findOne({ _id: new ObjectId(storeOwnerId) });
    if (!storeOwner) {
      return res.status(404).send('Store owner not found');
    }

    const itemIndex = storeOwner.store.items.findIndex(item => item._id === itemId);
    if (itemIndex === -1) {
      return res.status(404).send('Item not found');
    }

    const currentQuantity = storeOwner.store.items[itemIndex].quantity;
    const newQuantity = currentQuantity - quantity;

    // Log the quantities for debugging
    console.log(`Original quantity of item ${itemId}: ${currentQuantity}`);
    console.log(`Quantity to subtract: ${quantity}`);
    console.log(`New quantity: ${newQuantity}`);

    if (newQuantity < 0) {
      return res.status(400).send('Insufficient quantity in store');
    }

    // Update the quantity
    storeOwner.store.items[itemIndex].quantity = newQuantity;

    await collection.updateOne(
      { _id: new ObjectId(storeOwnerId) },
      { $set: { "store.items": storeOwner.store.items } }
    );

    res.status(200).send('Item quantity updated successfully');
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to create an order
router.post('/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  const { items, mainkey, timestamp, ccname, cartTotal, orderNumber, PatronId } = req.body; // Include PatronId in the request body

  try {
    const collection = await getCollection();

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(PatronId)) {
      return res.status(400).send('Invalid user ID or Patron ID');
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const newOrder = {
      items,
      mainkey,
      timestamp,
      ccname,
      cartTotal,
      orderNumber, // Use the order number generated on the frontend
      status: 'Pending',
      PatronId // Include PatronId in the order
    };

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { orders: newOrder } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send('Failed to add order');
    }

    for (const item of items) {
      const storeIdParts = item.storeId.split('-');
      const storeOwnerId = storeIdParts[0];

      const response = await axios.put(`http://localhost:5000/api/stores/${storeOwnerId}/items/${item.foodId}/quantity`, {
        quantity: item.quantity
      });

      if (response.status !== 200) {
        throw new Error(`Failed to update quantity for item ${item.foodId}`);
      }
    }

    res.status(201).send('Order added successfully');
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).send('Internal server error');
  }
});

router.post('/users/:userId/patronOrders', async (req, res) => {
  const { userId } = req.params;
  const { items, mainkey, timestamp, ccname, cartTotal, orderNumber } = req.body;

  try {
    const collection = await getCollection();

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const newOrder = {
      items,
      mainkey,
      timestamp,
      ccname,
      cartTotal,
      orderNumber, // Use the order number generated on the frontend
      status: 'Pending'
    };

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { patronOrders: newOrder } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send('Failed to add patron order');
    }

    res.status(201).send('Patron order added successfully');
  } catch (error) {
    console.error('Error adding patron order:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to clear the user's cart
router.delete('/users/:userId/cart/clear', async (req, res) => {
  const { userId } = req.params;

  try {
    const collection = await getCollection();

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { cart: [] } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).send('Failed to clear cart');
    }

    res.status(200).send('Cart cleared successfully');
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).send('Internal server error');
  }
});

router.post('/send-purchase-email', async (req, res) => {
  const { email, storeName, ccName, cartTotal, items, timestamp } = req.body;

  try {
    await sendPurchaseEmail(email, storeName, ccName, cartTotal, items, timestamp);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
});

export default router;

import express from 'express';
import connectToDatabase from './db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// the route to update store information
router.put('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  // Check user ID is valid
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // information from the request body
  const updatedStore = {
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
    items: req.body.items.map(item => ({
      ...item,
      _id: new ObjectId()
    }))
  };

  try {
    // Get the MongoDB collection
    const collection = await getCollection();

    // Update the store information for the specified user ID
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { store: updatedStore } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Store information updated successfully' });
    } else {
      // If no document was modified, the user might not exist
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating store information:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete an item from the store
router.delete('/users/:userId/store/items/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // No need to check for ObjectId.isValid for itemId since it's a random string
  if (!itemId) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { 'store.items': { _id: itemId } } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Item removed successfully' });
    } else {
      return res.status(404).json({ error: 'User or item not found' });
    }
  } catch (err) {
    console.error('Error removing item from store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to edit an item in the store's items array
// Route to edit an item in the store's items array
// Route to edit an item in the store's items array
// Route to update a specific item in the store
router.put('/users/:userId/store/items/:itemId', async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  // Check if user ID is valid
  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  // Ensure the item ID is a string
  if (typeof itemId !== 'string') {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  const updatedItem = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    _id: itemId // Ensure the _id is preserved as a string
  };

  try {
    const collection = await getCollection();

    // Update the specific item in the store.items array using the string itemId
    const result = await collection.updateOne(
      { _id: new ObjectId(userId), 'store.items._id': itemId },
      { $set: { 'store.items.$': updatedItem } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Item updated successfully' });
    } else {
      // If no document was modified, the user or item might not exist
      return res.status(404).json({ error: 'User or item not found' });
    }
  } catch (error) {
    console.error('Error updating item in store:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function generateRandomKey() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/users/:userId/create-compliment', async (req, res) => {
  try {
    const { title, amount, startDate, startTime, endTime, quantity } = req.body;
    const complimentGroupId = generateRandomKey(); // Unique identifier for the compliment group
    const compliments = [];

    for (let i = 0; i < quantity; i++) {
      const compliment = {
        groupId: complimentGroupId,
        title,
        amount,
        startDate,
        startTime,
        endTime,
        sent: false,
        claimed: false,
        id: generateRandomKey(), // Ensure id is unique
      };
      compliments.push(compliment);
    }

    const userId = new ObjectId(req.params.userId); // Convert userId to ObjectId
    const userCollection = await getCollection();
    const user = await userCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    await userCollection.updateOne(
      { _id: userId },
      { $push: { 'store.compliments': { $each: compliments } } }
    );

    res.status(201).send({ compliments });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while creating compliments' });
  }
});

router.post('/users/:userId/send-compliments', async (req, res) => {
  try {
    const { compliments, followers } = req.body;
    const userCollection = await getCollection();

    for (const compliment of compliments) {
      for (const follower of followers) {
        await userCollection.updateOne(
          { _id: new ObjectId(req.params.userId), 'store.compliments.id': compliment.id },
          { $set: { 'store.compliments.$.sent': true, 'store.compliments.$.recipient': follower.email } }
        );
      }
    }

    res.status(200).send({ message: 'Compliments sent successfully' });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while sending compliments' });
  }
});

router.get('/users/:userId/compliments', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId); // Convert userId to ObjectId
    const userCollection = await getCollection();
    const user = await userCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send({ compliments: user.store.compliments || [] });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while fetching compliments' });
  }
});

router.get('/users/all', async (req, res) => {
  try {
    const userCollection = await getCollection();
    const users = await userCollection.find({}).toArray();

    res.status(200).send({ users });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while fetching users' });
  }
});

export default router;
import express from 'express';
import connectToDatabase from './db/connection.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// Function to generate storeId
const generateStoreId = (userId) => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `${userId}-${randomDigits}`;
};

// Route to add a store to a user's profile
router.post('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const { name, description, location, items } = req.body;

  if (!name || !description || !location) {
    return res.status(400).json({ error: 'All store fields are required' });
  }

  // Generate storeId
  const storeId = generateStoreId(userId);

  const store = {
    name,
    description,
    location,
    storeId,
    items: items || [],
  };

  console.log('Store data being added:', store); // Log the store data being added

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { store: store } }
    );

    if (result.matchedCount === 1 && result.modifiedCount === 1) {
      return res.status(201).json({ message: 'Store added successfully' });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error adding store to user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to fetch store details for a user
router.get('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user || !user.store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    return res.status(200).json(user.store);
  } catch (err) {
    console.error('Error fetching store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete a user's store
router.delete('/users/:userId/store', async (req, res) => {
  const userId = req.params.userId;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $unset: { store: "" } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({ message: 'Store deleted successfully' });
    } else {
      return res.status(404).json({ error: 'User or store not found' });
    }
  } catch (err) {
    console.error('Error deleting store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to add an item to the store
router.post('/users/:userId/store/items', async (req, res) => {
  const userId = req.params.userId;
  const newItem = req.body;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (!newItem.title || !newItem.price || !newItem.quantity || !newItem.description || !newItem._id) {
    return res.status(400).json({ error: 'All item fields, including _id, are required' });
  }

  try {
    const collection = await getCollection();
    const newItemWithId = { ...newItem };

    console.log('Item data being added:', newItemWithId); // Log the item data being added

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { 'store.items': newItemWithId } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json(newItemWithId);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error adding item to store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update the user's cart
router.put('/users/:userId/cart', async (req, res) => {
  const userId = req.params.userId;
  const { cart } = req.body;

  if (!ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { cart: cart } }
    );

    if (result.matchedCount === 1) {
      return res.status(200).json({ message: 'Cart updated successfully', cart });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating cart:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// get all the stores 
// get all the stores 
// get all the stores 
// Route to get all stores
router.get('/stores', async (req, res) => {
  try {
    const collection = await getCollection();
    const usersWithStores = await collection.find({ store: { $exists: true } }).toArray();

    const stores = usersWithStores.map(user => ({
      userId: user._id,
      userName: user.username,
      userEmail: user.email,
      ...user.store
    }));

    res.status(200).json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).send('Internal server error');
  }
});

// Route to get individual store details by storeId
router.get('/stores/:storeId', async (req, res) => {
  const storeId = req.params.storeId;

  try {
    const collection = await getCollection();
    const user = await collection.findOne({ 'store.storeId': storeId });

    if (!user || !user.store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.status(200).json(user.store);
  } catch (err) {
    console.error('Error fetching store:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

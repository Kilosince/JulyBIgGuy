import express from 'express';
import connectToDatabase from './db/connection.js';
import { ObjectId } from 'mongodb';


const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('menus');
}

// Get a list of all records
router.get('/bank', async (req, res) => {
  try {
    const collection = await getCollection();
    const results = await collection.find().toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).send('Error fetching records');
  }
});

// Get a single record by id
router.get('/:id', async (req, res) => {
  try {
    const collection = await getCollection();
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) {
      res.status(404).send('Not found');
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    console.error('Error fetching record:', err);
    res.status(500).send('Error fetching record');
  }
});

// Create a new record
router.post('/add', async (req, res) => {
  try {
    const newDocument = {
      imagePath: req.body.imagePath,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      available_quantity: req.body.available_quantity,
    };

    const collection = await getCollection();
    const result = await collection.insertOne(newDocument);

    res.status(201).send(result);
  } catch (err) {
    console.error('Error adding record:', err);
    res.status(500).send('Error adding record');
  }
});

// Update a record by id
router.patch('/:id', async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        imagePath: req.body.imagePath,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        available_quantity: req.body.available_quantity,
      },
    };

    const collection = await getCollection();
    const result = await collection.updateOne(query, updates);

    res.status(200).send(result);
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).send('Error updating record');
  }
});

// Delete a record by id
router.delete('/:id', async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = await getCollection();
    const result = await collection.deleteOne(query);

    res.status(200).send(result);
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).send('Error deleting record');
  }
});

export default router;

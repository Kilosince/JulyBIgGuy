import express from 'express';
import connectToDatabase from './db/connection.js';


const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// Get a list of all records
router.get('/users', async (req, res) => {
  try {
    const collection = await getCollection();
    const results = await collection.find().toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).send('Error fetching records');
  }
});

export default router;

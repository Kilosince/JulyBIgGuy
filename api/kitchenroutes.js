import express from 'express';
import { ObjectId } from 'mongodb';
import connectToDatabase from './db/connection.js';

const router = express.Router();

async function getCollection() {
  const db = await connectToDatabase();
  return db.collection('users');
}

// Route to fetch orders for a specific user
router.get('/users/:userId/orders', async (req, res) => {
  const { userId } = req.params;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const orders = user.orders || [];

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/users/:userId/orders/:mainkey', async (req, res) => {
  const { userId, mainkey } = req.params;

  try {
    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const collection = await getCollection();
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { orders: { mainkey } } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).send('Order not found');
    }

    res.status(200).send('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send('Internal server error');
  }
});

const updateOrderStatus = async (req, res, newStatus) => {
  const { PatronId, mainkey } = req.params;

  try {
    // Ensure that PatronId is provided
    if (!PatronId || typeof PatronId !== 'string') {
      return res.status(400).send('Invalid or missing PatronId');
    }

    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(PatronId) }); // Convert PatronId to ObjectId

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Ensure that patronOrders is an array
    const patronOrders = user.patronOrders || [];

    if (!Array.isArray(patronOrders)) {
      return res.status(500).send('Internal server error: patronOrders is not an array');
    }

    const orderIndex = patronOrders.findIndex(order => order.mainkey === mainkey);

    if (orderIndex === -1) {
      return res.status(404).send('Order not found');
    }

    patronOrders[orderIndex].status = newStatus;

    await collection.updateOne(
      { _id: new ObjectId(PatronId) }, // Convert PatronId to ObjectId
      { $set: { patronOrders } }
    );

    res.status(200).send(`Order status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal server error');
  }
};

// Route to update order status to "Ready"
router.put('/users/:PatronId/orders/:mainkey/status/ready', (req, res) => {
  updateOrderStatus(req, res, 'Ready');
});

// Route to update order status to "Ready in 10 Minutes"
router.put('/users/:PatronId/orders/:mainkey/status/ready-in-10-minutes', (req, res) => {
  updateOrderStatus(req, res, 'Ready in 10 Minutes');
});

  router.get('/users/:userId/patronOrders', async (req, res) => {
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
  
      res.status(200).json({ patronOrders: user.patronOrders || [] });
    } catch (error) {
      console.error('Error fetching patron orders:', error);
      res.status(500).send('Internal server error');
    }
  });
  
 // Delete a patron order
router.delete('/users/:userId/patronOrders/:orderNumber/:mainkey', async (req, res) => {
  const { userId, orderNumber, mainkey } = req.params;

  try {
    const collection = await getCollection('users'); // Get the 'users' collection

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    const userObjectId = new ObjectId(userId);

    // Find the user document and remove the order from the patronOrders array
    const result = await collection.updateOne(
      { _id: userObjectId },
      { $pull: { patronOrders: { orderNumber: parseInt(orderNumber), mainkey } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Order not found or already deleted' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
export default router;

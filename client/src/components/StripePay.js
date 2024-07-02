import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import UserContext from '../context/UserContext';

const StripePay = ({ total }) => {
  const { authUser } = useContext(UserContext);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [name, setName] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`);
        if (response.status === 200) {
          setCart(response.data.cart);
        } else {
          console.error('Error fetching cart data: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    const createPaymentIntent = async () => {
      try {
        // Convert total to cents and round to nearest integer
        const amountInCents = Math.round(total * 100);
        const response = await axios.post('http://localhost:5000/api/create-payment-intent', { amount: amountInCents });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    if (total > 0) {
      fetchCartData();
      createPaymentIntent();
    }
  }, [total, authUser]);

  const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const generateRandomOrderNumber = () => {
    return Math.floor(Math.random() * 500) + 1;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: name,
        },
      },
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);

      const mainkey = generateRandomString();
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }); // Convert to PST
      const orderNumber = generateRandomOrderNumber(); // Generate order number on the frontend

      const groupedCartItems = cart.reduce((acc, item) => {
        const storeOwnerId = item.storeId.split('-')[0];
        if (!acc[storeOwnerId]) {
          acc[storeOwnerId] = [];
        }
        acc[storeOwnerId].push(item);
        return acc;
      }, {});

      for (const [storeOwnerId, items] of Object.entries(groupedCartItems)) {
        const newOrder = {
          items,
          mainkey,
          timestamp,
          ccname: name,
          cartTotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
          orderNumber, // Include the generated order number
          PatronId: authUser._id // Include the PatronId
        };

        // Send order to store owner
        await axios.post(`http://localhost:5000/api/users/${storeOwnerId}/orders`, newOrder);

        // Send order to patron's patronOrders array
        await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/patronOrders`, newOrder);

        // Send email to the user
        await axios.post('http://localhost:5000/api/send-purchase-email', {
          email: authUser.email,
          storeName: items[0].storeName, // Assuming storeName is available in the item data
          ccName: name,
          cartTotal: newOrder.cartTotal,
          items: newOrder.items.map(item => ({
            itemName: item.itemName,
            price: item.price,
            quantity: item.quantity,
          })), // Ensure only necessary item details are sent
          timestamp: timestamp,
        });
      }

      await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart/clear`);

      navigate('/authenticated');

      setName('');
      elements.getElement(CardElement).clear();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <CardElement />
      <button disabled={processing || succeeded}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div>{error}</div>}
      {succeeded && <div>Payment succeeded!</div>}
    </form>
  );
};

export default StripePay;

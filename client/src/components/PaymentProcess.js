import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import UserContext from '../context/UserContext';
import StripePay from './StripePay';



const PaymentProcess = ({ storeId }) => {
  const { authUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!authUser || !authUser._id) {
      console.error('User ID is undefined');
      return;
    }

    const fetchCartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`);
        if (response.status === 200) {
          const validCartItems = response.data.cart.filter(item => item && item.price !== undefined && item.quantity !== undefined);
          setCart(validCartItems);
          updateTotal(validCartItems);
        } else {
          console.error('Error fetching cart data: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    fetchCartData();
  }, [authUser]);

  const updateTotal = (cartItems) => {
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(totalAmount);
  };

  const handleDeleteItem = async (index) => {
    try {
      const itemId = cart[index]._id;
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart/items/${encodeURIComponent(itemId)}`);
      if (response.status === 200) {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        updateTotal(updatedCart);
      } else {
        console.error('Error deleting cart item:', response.status);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const handleEditItem = (index) => {
    const cartItem = cart[index];
    setEditIndex(index);
    setQuantity(cartItem.quantity);
    setNotes(cartItem.notes);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setQuantity('');
    setNotes('');
  };

  const handleGoBack = () => {
    navigate('/cartsview');
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>My Cart</h1>
      {cart.length > 0 ? (
        cart.map((cartItem, index) => (
          <div key={index} style={styles.card}>
            {editIndex === index ? (
              <div>
                <p>Title: {cartItem.storeName}</p>
                <p>Price: ${parseFloat(cartItem.price).toFixed(2)}</p>
                <p>
                  Quantity: <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={styles.input} />
                </p>
                <p>
                  Notes: <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={styles.input} />
                </p>
                <button onClick={handleCancelEdit} style={styles.button}>Cancel</button>
              </div>
            ) : (
              <div>
                <h3>{cartItem.itemName}</h3>
                <p>Price: ${parseFloat(cartItem.price).toFixed(2)}</p>
                <p>Quantity: {cartItem.quantity}</p>
                <p>Notes: {cartItem.notes}</p>
                <button onClick={() => handleEditItem(index)} style={{ ...styles.button, marginRight: '10px' }}>Edit</button>
                <button onClick={() => handleDeleteItem(index)} style={styles.button}>Delete</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>Cart is empty</p>
      )}
      <h3>Total: ${total.toFixed(2)}</h3>
      <Elements stripe={stripePromise}>
        <StripePay total={total} />
      </Elements>
      <button onClick={handleGoBack} style={{ ...styles.button, marginTop: '20px' }}>Go Back</button>
    </div>
  );
};

const styles = {
  card: {
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    textAlign: 'left',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    transition: '0.3s',
  },
  input: {
    width: '100px',
    marginLeft: '10px',
    padding: '5px',
    borderRadius: '3px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 15px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  }
};

export default PaymentProcess;

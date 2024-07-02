import React, { useState, useEffect, useContext } from 'react';
import UserContext from "../context/UserContext";
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { buttonStyles, paragraphStyles, useStoreDetailsStyles } from '../context/Default_Designs';
import Cart from './CartComp';

const StoreDetails = ({ userId }) => {
  const { storeId } = useParams();
  const { authUser } = useContext(UserContext);
  const storeDetailsStyles = useStoreDetailsStyles();
  const [store, setStore] = useState({ items: [] });
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stores/${storeId}`);
        if (response.status === 200) {
          setStore(response.data);
        } else {
          console.error('Error fetching store data: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

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

    fetchStoreData();
    fetchCartData();
  }, [storeId, authUser._id, userId]);

  const updateTotal = (cartItems) => {
    const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(totalAmount);
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({ ...prev, [itemId]: value }));
  };

  const handleNotesChange = (itemId, value) => {
    setNotes(prev => ({ ...prev, [itemId]: value }));
  };

  const addItemToCart = async (item) => {
    const itemWithStoreIdAndFoodId = {
      ...item,
      storeId,
      foodId: item._id // Add foodId from store item
    };

    try {
      // Add the new item to the cart
      const response = await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`, { item: itemWithStoreIdAndFoodId });
      if (response.status === 200) {
        console.log('Item added to cart successfully:', response.data);
        // Update cart locally
        const cartResponse = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`);
        setCart(cartResponse.data.cart);
        updateTotal(cartResponse.data.cart);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const addToCart = async (itemId) => {
    const item = store.items.find(item => item._id === itemId);
    const quantity = quantities[item._id];
    const note = notes[item._id];
    if (!quantity || quantity <= 0) {
      console.error('Quantity must be greater than 0');
      return;
    }

    const cartItem = {
      _id: '_' + Math.random().toString(36).substr(2, 9), // Generate unique _id for cart item
      storeName: store.name,
      itemName: item.title,
      quantity: quantity,
      notes: note,
      price: item.price,
      foodId: item._id // Add foodId from store item
    };

    try {
      await addItemToCart(cartItem);
      setQuantities(prev => ({ ...prev, [itemId]: '' }));
      setNotes(prev => ({ ...prev, [itemId]: '' }));
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  return (
    <div style={storeDetailsStyles.container}>
      <h1 style={storeDetailsStyles.itemTitle}>{store && store.name}</h1>
      <p style={paragraphStyles}>{store && store.description}</p>
      <p style={paragraphStyles}>{store && store.location}</p>

      <h2>Items</h2>
      {store && store.items.length > 0 ? (
        store.items.map(item => (
          <div key={item._id} style={storeDetailsStyles.itemContainer}>
            <h3 style={storeDetailsStyles.itemTitle}>{item.title}</h3>
            <p style={storeDetailsStyles.itemDescription}>Price: {item.price}</p>
            <p style={storeDetailsStyles.itemDescription}>Quantity Available: {item.quantity}</p>
            <p style={storeDetailsStyles.itemDescription}>Description: {item.description}</p>
            <div style={storeDetailsStyles.itemControls}>
              <label>Quantity to Order:</label>
              <input
                type="number"
                min="1"
                max={item.quantity}
                value={quantities[item._id] || ''}
                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
              />
              <label>Notes:</label>
              <input
                type="text"
                value={notes[item._id] || ''}
                onChange={(e) => handleNotesChange(item._id, e.target.value)}
              />
              <button style={buttonStyles} onClick={() => addToCart(item._id)}>Add to Cart</button>
            </div>
          </div>
        ))
      ) : (
        <p>No items available</p>
      )}
      <Cart cart={cart.filter(item => item && item.itemName)} total={total} />
      <Link className="paymentprocess" to="/paymentprocess" style={storeDetailsStyles.payButton}>Pay</Link>
    </div>
  );
};

export default StoreDetails;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { useDefaultStyles, paragraphStyles } from '../context/Default_Designs';

const PatronOrders = () => {
  const { authUser } = useContext(UserContext);
  const defaultStyles = useDefaultStyles();
  const [patronOrders, setPatronOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchPatronOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/patronOrders`);
        if (response.status === 200) {
          setPatronOrders(response.data.patronOrders);
          const initialExpanded = response.data.patronOrders.reduce((acc, _, index) => {
            acc[index] = false; // Set all orders to collapsed initially
            return acc;
          }, {});
          setExpandedOrders(initialExpanded);
        } else {
          console.error('Error fetching patron orders: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching patron orders:', error);
      }
    };

    if (authUser) {
      fetchPatronOrders();
    }
  }, [authUser]);

  const toggleOrder = (index) => {
    setExpandedOrders(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + Number(item.quantity), 0); // Ensure quantities are treated as numbers
  };

  const deleteOrder = async (orderNumber, mainkey) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/patronOrders/${orderNumber}/${mainkey}`);
      if (response.status === 200) {
        setPatronOrders(prevOrders => prevOrders.filter(order => order.orderNumber !== orderNumber || order.mainkey !== mainkey));
      } else {
        console.error('Error deleting order: status', response.status);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Your Orders</h2>
      <div style={{ ...defaultStyles, color: 'black' }}>
        <p style={{ ...paragraphStyles, color: 'black' }}>Total Orders: {patronOrders.length}</p>
      </div>
      {patronOrders.length > 0 ? (
        patronOrders.map((order, index) => (
          <div key={order.mainkey} style={{ ...defaultStyles, position: 'relative', marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div onClick={() => toggleOrder(index)} style={{ cursor: 'pointer', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '10px' }}>
              <h1 style={{ color: defaultStyles.backgroundColor }}>
                Order #{order.orderNumber}
              </h1>
              <p style={{ marginTop: '5px' }}>
                <span>Total Items: {calculateTotalItems(order.items)}</span>
                <span style={{ marginLeft: '20px' }}>Total: ${order.cartTotal.toFixed(2)}</span> {/* Format total price to 2 decimal places */}
              </p>
              <p>Main Key: {order.mainkey}</p>
              <p>Timestamp: {order.timestamp}</p>
              <p>Credit Card Name: {order.ccname}</p>
              <p style={{
                color: 'black',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                Status: {order.status}
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: order.status === 'Ready' ? 'green' : order.status === 'pending' ? 'red' : 'yellow',
                  borderRadius: '50%',
                  marginLeft: '8px'
                }}></span>
              </p>
            </div>
            {expandedOrders[index] && (
              <div>
                <h3>Items:</h3>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ marginBottom: '10px', borderBottom: `1px solid ${defaultStyles.backgroundColor}`, paddingBottom: '10px' }}>
                    <p style={{ backgroundColor: defaultStyles.accentColor, color: 'black', padding: '5px', borderRadius: '3px' }}>Item Name: {item.itemName}</p>
                    <p>Item ID: {item.foodId}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ${item.price}</p>
                  </div>
                ))}
                <button onClick={() => deleteOrder(order.orderNumber, order.mainkey)} style={{ backgroundColor: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
                  Delete Order
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
};

export default PatronOrders;

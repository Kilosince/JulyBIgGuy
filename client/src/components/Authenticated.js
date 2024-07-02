import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import UserContext from "../context/UserContext";
import Kitchen from './Kitchen';
import PatronOrders from './PatronOrders';
import ThemeContext from '../context/ThemeContext';


const Authenticated = () => {
  const { authUser } = useContext(UserContext);
  const { accentColor } = useContext(ThemeContext);
  const [patronOrders, setPatronOrders] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchPatronOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/patronOrders`);
        if (response.status === 200) {
          setPatronOrders(response.data.patronOrders);
        } else {
          console.error('Error fetching patron orders: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching patron orders:', error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/orders`);
        if (response.status === 200) {
          setOrders(response.data.orders);
        } else {
          console.error('Error fetching orders: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (authUser) {
      fetchPatronOrders();
      fetchOrders();
    }
  }, [authUser]);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h1>{authUser.name} is Authenticated</h1>
      <p>{authUser.username}</p>
      
      <div>
        {orders.length > 0 ? (
          <Kitchen orders={orders} />
        ) : (
          <div style={{ border: `2px solid ${accentColor}`, borderRadius: '8px', padding: '20px', margin: '20px 0', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <h2>Are You Ready to Create Your Store?</h2>
            <Link to="/createstore" style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }}>Create Store</Link>
          </div>
        )}
        {patronOrders.length > 0 ? (
          <PatronOrders patronOrders={patronOrders} />
        ) : (
          <div style={{ border: `2px solid ${accentColor}`, borderRadius: '8px', padding: '20px', margin: '20px 0', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            <h2>Want Something to Eat?</h2>
            <Link to="/storelist" style={{ color: '#007BFF', textDecoration: 'none', fontWeight: 'bold' }}>Browse Stores</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Authenticated;

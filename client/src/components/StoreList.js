import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { paragraphStyles, useStoresListStyles } from '../context/Default_Designs';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();
  const storesListStyles = useStoresListStyles();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stores');
        if (response.status === 200) {
          setStores(response.data.stores);
        } else {
          console.error('Error fetching stores: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <div style={storesListStyles.container}>
      <h1>All Stores</h1>
      {stores.length > 0 ? (
        stores.map((store) => (
          <div key={store.storeId} style={storesListStyles.storeContainer}>
            <h2 style={storesListStyles.storeTitle} onClick={() => handleStoreClick(store.storeId)}>{store.name}</h2>
            <p style={paragraphStyles}>Description: {store.description}</p>
            <p style={paragraphStyles}>Location: {store.location}</p>
            <p style={{ ...paragraphStyles, ...storesListStyles.storeDetails }}>Owner: {store.userName} ({store.userEmail})</p>
          </div>
        ))
      ) : (
        <p>No stores found</p>
      )}
    </div>
  );
};

export default StoresList;

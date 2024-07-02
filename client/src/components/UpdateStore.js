import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { useDefaultStyles, paragraphStyles, marginStyles } from '../context/Default_Designs';
import useTheme from '../context/useTheme';

const UpdateStore = () => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [items, setItems] = useState([]);
  const [storeExists, setStoreExists] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItemData, setEditItemData] = useState({ title: '', description: '', price: '', quantity: '' });
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: '', description: '', price: '', quantity: '' });
  const [flashMessage, setFlashMessage] = useState('');
  const navigate = useNavigate();
  const { authUser } = useContext(UserContext);

  const [originalStoreData, setOriginalStoreData] = useState({});

  const { accentColor } = useTheme();
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
        if (response.status === 200) {
          setStoreExists(true);
          setStoreName(response.data.name);
          setStoreDescription(response.data.description);
          setStoreLocation(response.data.location);
          setItems(response.data.items || []);
          setOriginalStoreData({
            name: response.data.name,
            description: response.data.description,
            location: response.data.location
          });
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStoreData();
  }, [authUser._id]);

  const generateUniqueItemId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 7; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomString;
  };

  const deleteStore = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
      if (response.status === 200) {
        console.log('Store deleted successfully');
        setStoreExists(false);
        navigate('/authenticated');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const startEditItem = (index) => {
    setEditItemIndex(index);
    setEditItemData(items[index]);
  };

  const handleEditItemChange = (e) => {
    const { name, value } = e.target;
    setEditItemData({ ...editItemData, [name]: value });
  };

  const saveEditItem = async () => {
    try {
      const updatedItems = items.map((item, index) => index === editItemIndex ? editItemData : item);
      const itemId = editItemData._id; // Get the _id of the item being edited
      const response = await axios.put(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items/${encodeURIComponent(itemId)}`, editItemData);

      if (response.status === 200) {
        console.log('Item updated successfully');
        setItems(updatedItems);
        setEditItemIndex(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (itemId, index) => {
    if (!itemId) {
      console.error('Invalid item ID');
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items/${encodeURIComponent(itemId)}`);

      if (response.status === 200) {
        console.log('Item removed successfully');
        const updatedItems = items.filter((item, i) => i !== index); // Remove the item at the specified index
        setItems(updatedItems); // Update the items state
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const startEditStore = () => {
    setIsEditingStore(true);
    setFlashMessage('');
  };

  const cancelEditStore = () => {
    setStoreName(originalStoreData.name);
    setStoreDescription(originalStoreData.description);
    setStoreLocation(originalStoreData.location);
    setIsEditingStore(false);
    setFlashMessage('');
  };

  const saveEditStore = async () => {
    if (storeName === '' || storeDescription === '' || storeLocation === '') {
      setFlashMessage('Please fill in all fields before saving.');
      return;
    }
    try {
      const updatedStore = {
        name: storeName,
        description: storeDescription,
        location: storeLocation,
        items: items // Ensure items are saved correctly
      };
      const response = await axios.put(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`, updatedStore);
      if (response.status === 200) {
        setStoreExists(true);
        setIsEditingStore(false); // Set to false to revert back to original display mode
        setFlashMessage('');
        setOriginalStoreData({
          name: storeName,
          description: storeDescription,
          location: storeLocation,
        });
      } else {
        setFlashMessage('Failed to save store changes.');
      }
    } catch (error) {
      console.error('Cannot save unchanged fields. If no changes, please press cancel:', error);
      setFlashMessage('Cannot save unchanged fields. If no change, please press cancel');
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemData({ ...newItemData, [name]: value });
  };

  const compliments = (e) => {
    navigate('/compliments');
  };

  const addNewItem = async () => {
    if (newItemData.title === '' || newItemData.description === '' || newItemData.price === '' || newItemData.quantity === '') {
      setFlashMessage('Please fill in all fields before adding a new item.');
      return;
    }

    // Add unique ID and highlight color index
    const newItemWithIdAndColor = {
      ...newItemData,
      _id: generateUniqueItemId(),
      highlightColorIndex: 0
    };

    try {
      const response = await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items`, newItemWithIdAndColor);

      if (response.status === 200) {
        console.log('Item added successfully');
        const newItem = response.data; // Use the response data which includes the generated _id
        setItems([...items, newItem]);
        setNewItemData({ title: '', description: '', price: '', quantity: '' });
        setFlashMessage('');
      }
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  const buttonStyles = {
    backgroundColor: 'transparent',
    color: accentColor,
    border: `1px solid ${accentColor}`,
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
    margin: '10px 5px',
  };

  const buttonRemoveStyles = {
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'inline-block',
    marginTop: '10px',
  };

  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: `2px solid ${accentColor}`,
    marginBottom: '50px', // Add margin-bottom to avoid overlapping the footer
  };

  const storeNameStyles = {
    fontWeight: '300', // Lighter font weight
    color: '#333', // Darker color for a more professional look
    fontSize: '2rem', // Larger font size
    marginBottom: '10px',
  };

  return (
    <div style={containerStyles}>
      {flashMessage && <div style={{ color: 'red', marginBottom: '10px' }}>{flashMessage}</div>}
      {storeExists ? (
        <>
          {isEditingStore ? (
            <>
              <div style={marginStyles.medium}>
                <label>Store Name:</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              </div>
              <div style={marginStyles.medium}>
                <label>Store Description:</label>
                <input type="text" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} required />
              </div>
              <div style={marginStyles.medium}>
                <label>Store Location:</label>
                <input type="text" value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={saveEditStore} style={buttonStyles}>Save Store Changes</button>
                <button onClick={cancelEditStore} style={buttonRemoveStyles}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h1 style={storeNameStyles}>{storeName}</h1>
              <p style={paragraphStyles}>{storeDescription}</p>
              <p style={paragraphStyles}>{storeLocation}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={startEditStore} style={buttonStyles}>Edit Store</button>
                <button onClick={compliments} style={buttonStyles}>Create Compliments</button>
                <button onClick={deleteStore} style={buttonRemoveStyles}>Delete Store</button>
               </div>
            </>
          )}
        </>
      ) : (
        <h2 style={defaultStyles}>No Store Found</h2>
      )}
      <div>
        <h2 style={paragraphStyles}>Items</h2>
        {items.map((item, index) => (
          <div key={item._id} style={{ backgroundColor: '#f9f9f9', marginBottom: '10px', padding: '10px', border: '2px solid #ccc', borderRadius: '5px' }}>
            {editItemIndex === index ? (
              <>
                <div style={marginStyles.medium}>
                  <label>Title:</label>
                  <input type="text" name="title" value={editItemData.title} onChange={handleEditItemChange} required />
                </div>
                <div style={marginStyles.medium}>
                  <label>Price:</label>
                  <input type="number" name="price" value={editItemData.price} onChange={handleEditItemChange} required />
                </div>
                <div style={marginStyles.medium}>
                  <label>Quantity:</label>
                  <input type="number" name="quantity" value={editItemData.quantity} onChange={handleEditItemChange} required />
                </div>
                <div style={marginStyles.medium}>
                  <label>Description:</label>
                  <input type="text" name="description" value={editItemData.description} onChange={handleEditItemChange} required />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={saveEditItem} style={{ ...buttonStyles, width: '100px' }}>Save</button>
                  <button onClick={() => setEditItemIndex(null)} style={{ ...buttonRemoveStyles, width: '100px' }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h1>{item.title}</h1>
                <p>Quantity: {item.quantity}</p>
                <p>Description: {item.description}</p>
                <p>Price: ${item.price}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => startEditItem(index)} style={{ ...buttonStyles, width: '100px' }}>Edit</button>
                  <button onClick={() => removeItem(item._id, index)} style={{ ...buttonRemoveStyles, width: '100px' }}>Remove</button>
                </div>
              </>
            )}
          </div>
        ))}
        <div style={{ marginTop: '20px', padding: '10px', border: `2px solid ${accentColor}`, borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h2>New Item</h2>
          <div style={marginStyles.medium}>
            <label>Title:</label>
            <input type="text" name="title" value={newItemData.title} onChange={handleNewItemChange} required />
          </div>
          <div style={marginStyles.medium}>
            <label>Price:</label>
            <input type="number" name="price" value={newItemData.price} onChange={handleNewItemChange} required />
          </div>
          <div style={marginStyles.medium}>
            <label>Quantity:</label>
            <input type="number" name="quantity" value={newItemData.quantity} onChange={handleNewItemChange} required />
          </div>
          <div style={marginStyles.medium}>
            <label>Description:</label>
            <input type="text" name="description" value={newItemData.description} onChange={handleNewItemChange} required />
          </div>
          <button onClick={addNewItem} style={buttonStyles}>Add New Item</button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStore;

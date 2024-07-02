import React, { useState, useEffect } from 'react';
import axios from 'axios';



const CreateItems = () => {
  const [menuData, setMenuData] = useState({
    imagePath: '',
    title: '',
    description: '',
    price: '',
    available_quantity: ''
  });

  //const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulating fetching users
   // setUsers(['test this']);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    const menu = {
      ...menuData
    };
    
console.log(menu);

try {
  const res = await axios.post('http://localhost:5000/menu/add', menu);
  console.log(res.data);

  // Reset the form fields
  setMenuData({
    title: '',
    description: '',
    price: '',
    available_quantity: '',
    imagePath: ''
  });
} catch (err) {
  console.error(err);
}
};

  return (
    <div>
      <h3>Create New Menu Log</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Image Path: </label>
          <input
            type="text"
            required
            className="form-control"
            name="imagePath"
            value={menuData.imagePath}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Title: </label>
          <input
            type="text"
            required
            className="form-control"
            name="title"
            value={menuData.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Description: </label>
          <input
            type="text"
            required
            className="form-control"
            name="description"
            value={menuData.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Available Quantity: </label>
          <input
            type="text"
            className="form-control"
            name="available_quantity"
            value={menuData.available_quantity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Price: </label>
          <input
            type="text"
            className="form-control"
            name="price"
            value={menuData.price}
            onChange={handleChange}
          />
        </div>

       

        <div className="form-group">
          <input type="submit" value="Create Menu Log" className="btn btn-primary" />
        </div>
      </form>
    </div>
  );
};

export default CreateItems;

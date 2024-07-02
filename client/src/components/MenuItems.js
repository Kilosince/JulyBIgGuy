import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MenuItems() {
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/menu/bank');
        console.log(res);
        setMenuData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Dependency array ensures this runs only once when the component mounts

  return (
    <div>
      {/* Render the menu data */}
      {menuData.length > 0 ? (
        <ul>
          {menuData.map(menu => (
            <li key={menu._id}>
                <ul>{menu.title}</ul>
                <ul>{menu.description}</ul>
                <ul>{menu.price}</ul>
                <ul>{menu.available_quantity}</ul>
                </li>
            

          ))}
        </ul>
      ) : (
        <p>No menu items available.</p>
      )}
    </div>
  );
}

export default MenuItems;
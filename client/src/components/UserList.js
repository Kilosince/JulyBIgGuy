import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserList() {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/users');
        console.log(res);
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Dependency array ensures this runs only once when the component mounts

  return (
    <div>
      {/* Render the user data */}
      {userData.length > 0 ? (
        <ul>
          {userData.map(indi => (
            <li key={indi._id}>
                <ul>{indi.name}</ul>
                <ul>{indi.kind}</ul>
                <ul>{indi.email}</ul>
                </li>
            

          ))}
        </ul>
      ) : (
        <p>No users items available.</p>
      )}
    </div>
  );
}

export default UserList;
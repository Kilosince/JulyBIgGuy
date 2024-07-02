import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/compliment.css';
import useTheme from '../context/useTheme';

const Followers = () => {
  const [users, setUsers] = useState([]);
  const { accentColor } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/all');
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ border: `1px solid ${accentColor}`}}className="followers-container">
      <h2>Followers</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            <p>Name: {user.name}</p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Followers;

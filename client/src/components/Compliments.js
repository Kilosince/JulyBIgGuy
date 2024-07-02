import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import useTheme from '../context/useTheme';
import '../styles/compliment.css';

const Compliment = () => {
  const { authUser } = useContext(UserContext);
  const { accentColor } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [createdCompliments, setCreatedCompliments] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [inputVisible, setInputVisible] = useState(true);
  const [collapseSent, setCollapseSent] = useState(true);

  useEffect(() => {
    const fetchCompliments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/compliments`);
        setCreatedCompliments(response.data.compliments);
        if (response.data.compliments.length > 0) {
          setInputVisible(false);
        }
      } catch (error) {
        console.error('Error fetching compliments:', error);
      }
    };

    const fetchFollowers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/all`);
        setFollowers(response.data.users);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };

    fetchCompliments();
    fetchFollowers();
  }, [authUser._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/create-compliment`, {
        title,
        amount,
        startDate,
        startTime,
        endTime,
        quantity,
      });
      setCreatedCompliments(response.data.compliments);
      setInputVisible(false);
    } catch (error) {
      console.error('Error creating compliments:', error);
    }
  };

  const handleSendComplimentToFollower = async (follower) => {
    const remainingCompliments = createdCompliments.filter(compliment => !compliment.sent);
    if (remainingCompliments.length > 0) {
      const complimentToSend = remainingCompliments[0];
      try {
        await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/send-compliments`, {
          compliments: [complimentToSend],
          followers: [follower],
        });
        const updatedCompliments = createdCompliments.map(compliment =>
          compliment.id === complimentToSend.id
            ? { ...compliment, sent: true, recipient: follower.email }
            : compliment
        );
        setCreatedCompliments(updatedCompliments);
      } catch (error) {
        console.error('Error sending compliment:', error);
      }
    }
  };

  const handleDistributeRemainingCompliments = async () => {
    const remainingCompliments = createdCompliments.filter(compliment => !compliment.sent);
    const followersWithoutCompliments = followers.filter(follower => !createdCompliments.some(compliment => compliment.recipient === follower.email));

    if (remainingCompliments.length > 0 && followersWithoutCompliments.length > 0) {
      const numberOfComplimentsToSend = Math.min(remainingCompliments.length, followersWithoutCompliments.length);

      try {
        // Loop through the number of compliments to send and assign them to followers
        for (let i = 0; i < numberOfComplimentsToSend; i++) {
          const complimentToSend = remainingCompliments[i];
          const followerToReceive = followersWithoutCompliments[i];

          await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/send-compliments`, {
            compliments: [complimentToSend],
            followers: [followerToReceive],
          });

          const updatedCompliments = createdCompliments.map(compliment =>
            compliment.id === complimentToSend.id
              ? { ...compliment, sent: true, recipient: followerToReceive.email }
              : compliment
          );
          setCreatedCompliments(updatedCompliments);
        }
      } catch (error) {
        console.error('Error distributing compliments:', error);
      }
    }
  };

  const toggleCollapseSent = () => {
    setCollapseSent(!collapseSent);
  };

  const unsentComplimentsCount = createdCompliments.filter(compliment => !compliment.sent).length;

  return (
    <div className="compliment-container">
      <div className="compliment-card">
        {!inputVisible && createdCompliments.length > 0 && <h1>{createdCompliments[0].title}</h1>}
        {inputVisible && (
          <div>
            <h2>Create Compliment</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount (%)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="time"
                placeholder="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                placeholder="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button type="submit">Create Compliment</button>
            </form>
          </div>
        )}
        <hr />
        <h3>Unsent Compliments: {unsentComplimentsCount}</h3>
        <button onClick={handleDistributeRemainingCompliments} className="distribute-button">
          Distribute Compliments
        </button>
        <div className="sent-compliments">
          <h3 onClick={toggleCollapseSent} style={{ cursor: 'pointer' }}>
            {collapseSent ? 'Show Sent Compliments' : 'Hide Sent Compliments'}
          </h3>
          {!collapseSent && (
            <div>
              {createdCompliments.filter(compliment => compliment.sent).map((compliment, index) => (
                <div key={index} className="compliment-item">
                  <p><strong>Amount:</strong> {compliment.amount}%</p>
                  <p><strong>Start Time:</strong> {compliment.startTime}</p>
                  <p><strong>End Time:</strong> {compliment.endTime}</p>
                  <p><strong>Recipient:</strong> {compliment.recipient}</p>
                  <p><strong>Recipient's Name:</strong> {followers.find(f => f.email === compliment.recipient)?.username}</p>
                  <span className="red-mark">✔</span>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </div>
        {followers.length > 0 && (
          <div style={{ border: `1px solid ${accentColor}` }} className="followers-container">
            <h2>Followers</h2>
            <ul>
              {followers.map((follower, index) => (
                <li key={index} className="follower-item">
                  <p>Name: {follower.name}</p>
                  <p>Username: {follower.username}</p>
                  <p>Email: {follower.email}</p>
                  {!createdCompliments.some(compliment => compliment.recipient === follower.email) && (
                    <button onClick={() => handleSendComplimentToFollower(follower)}>Send Compliment</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliment;

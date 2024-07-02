import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import DarkMode from "./themes/DarkMode";
import AccentColor from "./themes/AccentColor";
import FontSize from "./themes/FontSize";

function Settings() {
  const { authUser, actions } = useContext(UserContext);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteUser = async () => {
    if (confirmEmail !== authUser.email) {
      alert("Email does not match. Please type your email correctly to confirm.");
      return;
    }

    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}`);
        if (response.status === 200) {
          alert('Account deleted successfully.');
          // Clear user context and remove cookie
          actions.signOut(); // Call signOut function
          navigate('/signup'); // Redirect to /sign route
        } else {
          console.error('Error deleting account: status', response.status);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="bounds">
      <div className="grid-100">
        <h1>Preferences</h1>
        <DarkMode />
        <AccentColor />
        <FontSize />
        {!isDeleting && (
          <button 
            onClick={() => setIsDeleting(true)} 
            style={{ 
              backgroundColor: 'white', 
              color: 'red', 
              padding: '10px', 
              borderRadius: '5px', 
              border: '2px solid red', 
              marginTop: '20px' 
            }}
          >
            Delete Account
          </button>
        )}
        {isDeleting && (
          <div style={{ marginTop: '20px' }}>
            <input 
              type="email" 
              placeholder="Type your email to confirm" 
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)} 
              style={{ 
                marginRight: '10px', 
                padding: '10px', 
                borderRadius: '5px', 
                border: '2px solid red',
                backgroundColor: '#ffe6e6'
              }}
            />
            <button 
              onClick={handleDeleteUser} 
              style={{ 
                backgroundColor: 'red', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '5px' 
              }}
            >
              Confirm Account Deletion
            </button>
            <button 
              onClick={() => setIsDeleting(false)} 
              style={{ 
                backgroundColor: 'grey', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '5px', 
                marginLeft: '10px' 
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;

import { useContext, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ErrorsDisplay from './ErrorsDisplay';
import ThemeContext from '../context/ThemeContext';
import UserContext from '../context/UserContext';

const UserSignIn = ({ setUserId }) => {
  const { actions } = useContext(UserContext);
  const { accentColor } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    let from ='/authenticated';
    if (location.state) {
      from = location.state.from
    }

    const credentials = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };
    
    try {
      const user = await actions.signIn(credentials);
      if (user) {
        console.log('User signed in:', user); // Debug log
        navigate(from);
       
      } else {
        setErrors(["Sign-in was unsuccessful"]);
      }
    } catch (error) {
      console.log(error);
      navigate("/error");
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <div className="bounds">
      <div className="grid-33 centered signin">
        <h1>Sign in</h1>
        <div>
          <ErrorsDisplay errors={errors} />
          <form onSubmit={handleSubmit}>
            <input id="email" name="email" type="email" ref={emailRef} placeholder="Email Address" />
            <input id="password" name="password" type="password" ref={passwordRef} placeholder="Password" />
            <div className="pad-bottom">
              <button className="button" type="submit" style={{ background: accentColor }}>Sign in</button>
              <button className="button button-secondary" style={{ color: accentColor }} onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
        <p>Don't have a user account? <Link style={{ color: accentColor }} to="/signup">Click here</Link> to sign up!</p>
      </div>
    </div>
  );
}

export default UserSignIn;
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';

const Footer = () => {
  const { accentColor } = useContext(ThemeContext);

  const linkStyles = {
    color: '#FFFFFF', // Main font color to white
    textDecoration: 'none', // Remove underline
    fontWeight: '300', // Bold text
    fontSize: '1.2rem', // Slightly larger font size
    transition: 'color 0.3s ease', // Smooth transition for color
    display: 'inline-block', // Allow padding and margin
    padding: '10px 15px', // Padding around the link
    borderRadius: '5px', // Rounded corners
    margin: '20px 0', // Margin to add space around the link
  };

  const linkHoverStyles = {
    color: '#CCCCCC', // Lighter shade on hover
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.currentTarget.style, linkHoverStyles);
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.currentTarget.style, linkStyles);
  };

  return (
    <div className="footer" style={{ background: accentColor, padding: '1px', textAlign: 'right' }}>
      <div className="bounds">
        <Link
          to="https://www.instagram.com/theflyinginsta/"
          style={linkStyles}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          theflyinginsta
        </Link>
      </div>
    </div>
  );
};

export default Footer;

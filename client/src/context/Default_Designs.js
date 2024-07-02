import useTheme from './useTheme';

export const useDefaultStyles = () => {
  const { accentColor } = useTheme();

  return {
    border: `2px solid ${accentColor}`,
    borderRadius: '10px', // Increased border-radius for a modern look
    padding: '20px',
    margin: '10px 0',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Added box-shadow for modern look
  };
};

export const paragraphStyles = {
  margin: '10px 0',
  lineHeight: '1.5',
};

export const divStyles = {
  margin: '10px 0',
  padding: '20px 0',
};

export const buttonStyles = {
  border: 'none',
  padding: '12px 18px', // Increased padding for better touch targets
  borderRadius: '25px', // Rounded corners for a modern look
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  fontSize: '1em',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Added box-shadow for buttons
  transition: 'background-color 0.3s ease, transform 0.3s ease', // Smooth transitions
};

export const buttonReadyStyles = {
  ...buttonStyles,
  backgroundColor: '#28a745', // Green for ready
  color: 'white',
  marginRight: '10px',
  '&:hover': {
    backgroundColor: '#218838', // Darker green on hover
    transform: 'translateY(-2px)', // Slight lift on hover
  },
};

export const buttonReadyIn10Styles = {
  ...buttonStyles,
  backgroundColor: '#ffc107', // Yellow for ready in 10 minutes
  color: 'black',
  '&:hover': {
    backgroundColor: '#e0a800', // Darker yellow on hover
    transform: 'translateY(-2px)', // Slight lift on hover
  },
};

export const buttonDeleteStyles = {
  ...buttonStyles,
  backgroundColor: '#dc3545', // Red for delete
  color: 'white',
  position: 'absolute',
  top: '10px',
  right: '10px',
  '&:hover': {
    backgroundColor: '#c82333', // Darker red on hover
    transform: 'translateY(-2px)', // Slight lift on hover
  },
};

export const itemNameStyles = {
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '10px',
};

export const marginStyles = {
  small: {
    margin: '5px',
  },
  medium: {
    margin: '10px',
  },
  large: {
    margin: '15px',
  },
};

export const useStoreDetailsStyles = () => {
  const { accentColor } = useTheme();

  return {
    container: {
      margin: '20px auto',
      padding: '20px',
      maxWidth: '800px',
      borderRadius: '8px',
      border: `1px solid ${accentColor}`,
      backgroundColor: '#f9f9f9',
    },
    itemContainer: {
      border: `1px solid #ddd`,
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '15px',
    },
    itemTitle: {
      fontWeight: 'bold',
      fontSize: '1.2em',
      marginBottom: '10px',
    },
    itemDescription: {
      marginBottom: '10px',
    },
    itemDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    itemControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    payButton: {
      ...buttonStyles,
      backgroundColor: 'blue',
      color: 'white',
      display: 'inline-block',
      marginTop: '20px',
      textAlign: 'center',
    },
  };
};

export const useStoresListStyles = () => {
  const { accentColor } = useTheme();

  return {
    container: {
      margin: '20px auto',
      padding: '20px',
      maxWidth: '1200px',
      borderRadius: '8px',
      border: `1px solid ${accentColor}`,
      backgroundColor: '#f9f9f9',
    },
    storeContainer: {
      border: `2px solid ${accentColor}`,
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '20px',
      backgroundColor: '#fff',
    },
    storeTitle: {
      color: '#333',
      cursor: 'pointer',
      marginBottom: '10px',
    },
    storeDetails: {
      fontSize: '0.8em',
      color: '#666',
    },
  };
};

import React from 'react';
import Footer from './Footer'; // Adjust the import path as necessary

const Layout = ({ children }) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },
    content: {
      flex: '1',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;

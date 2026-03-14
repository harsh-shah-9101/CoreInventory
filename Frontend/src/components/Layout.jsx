import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg)', width: '100%' }}>
      {children}
    </div>
  );
};

export default Layout;

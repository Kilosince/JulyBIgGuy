import React, { useEffect } from 'react';

const Cart = ({ cart = [], total = 0 }) => {
  useEffect(() => {
    console.log('Cart updated:', cart);
    console.log('Total updated:', total);
  }, [cart, total]);

  return (
    <div>
      <h2>Cart</h2>
      {cart.length > 0 ? (
        cart.map((cartItem, index) => (
          <div key={index}>
            <p>
              {cartItem.itemName} - Quantity: {cartItem.quantity} - Notes: {cartItem.notes} - Price: ${parseFloat(cartItem.price).toFixed(2)} - Store: {cartItem.storeName}
            </p>
          </div>
        ))
      ) : (
        <p>Cart is empty</p>
      )}
      <h3>Total: ${parseFloat(total).toFixed(2)}</h3>
    </div>
  );
};

export default Cart;

import React, { useState } from "react";

/**
 * Payment summary / checkout panel shown before the user confirms payment.
 * Props: cart (array), pay (async function)
 */
function PaymentSummary({ cart, pay }) {
  const total = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  );
  const [loading, setLoading] = useState(false);

  const makePayment = async () => {
    setLoading(true);
    await pay();
  };

  return (
    <div className="payment-summary">
      <div className="payment-details">
        <p className="eyebrow">ORDER SUMMARY</p>
        <h2>Items you are buying</h2>
        <div className="checkout-items">
          {cart.map((item, index) => (
            <div className="checkout-item" key={`${item._id}-${index}`}>
              <span>
                {item.name} <small>× {item.quantity}</small>
              </span>
              <strong>₹{(item.sellingPrice * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <h2>Total amount</h2>
        <strong className="total">₹{total.toFixed(2)}</strong>
      </div>
      <button className="primary" disabled={loading} onClick={makePayment}>
        {loading ? <span className="spinner"></span> : "Make Payment"}
      </button>
    </div>
  );
}

export default PaymentSummary;

import React, { useState, useEffect } from "react";
import Card from "../components/Card.jsx";
import {
  getInventoryWarnings,
  getIngredientOrders,
  placeIngredientOrder,
  payIngredientOrder,
} from "../api/inventoryApi.js";
import { getAccountBalance } from "../api/accountApi.js";

/**
 * Inventory page — shows low-stock warnings and ingredient purchase orders.
 * Props: session, onBalanceChange(newBalance)
 */
function InventoryPage({ session, onBalanceChange }) {
  const [ingredients, setIngredients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payingId, setPayingId] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      getInventoryWarnings(session.token),
      getIngredientOrders(session.token),
    ])
      .then(([warnings, orderList]) => {
        setIngredients(warnings);
        setOrders(orderList);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, [session.token]);

  const place = async (ingredient) => {
    const { ok, data } = await placeIngredientOrder(
      ingredient._id,
      session.token
    );
    if (!ok) setError(data.message);
    else load();
  };

  const pay = async (order) => {
    setPayingId(order._id);
    setError("");
    try {
      const { ok, data } = await payIngredientOrder(order._id, session.token);
      if (!ok) throw new Error(data.message || `Payment failed`);
      const { data: account } = await getAccountBalance(session.token);
      onBalanceChange?.(account.balance);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setPayingId("");
    }
  };

  return (
    <section>
      <div className="cards">
        <Card title="Needs attention" value={ingredients.length} tone="orange" />
        <Card title="Healthy stock" value={20 - ingredients.length} tone="green" />
      </div>
      {error && <div className="toast">{error}</div>}
      <div className="panel">
        <div className="section-head">
          <h2>Needs attention</h2>
          <span>Live inventory</span>
        </div>
        {ingredients.map((ingredient) => (
          <div className="row" key={ingredient._id}>
            <span className="dot orange"></span>
            <div>
              <b>{ingredient.name}</b>
              <small>
                {ingredient.currentStock} {ingredient.unit} remaining · threshold{" "}
                {ingredient.calculatedThreshold}
              </small>
            </div>
            <button className="outline" onClick={() => place(ingredient)}>
              Place order
            </button>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="section-head">
          <h2>Ingredient orders</h2>
          <span>Pending payment</span>
        </div>
        {orders.map((order) => (
          <div className="row" key={order._id}>
            <div>
              <b>{order.ingredientName}</b>
              <small>
                {order.quantity} units · ₹{order.amount}
              </small>
            </div>
            <span className="status pending">{order.status}</span>
            {order.status !== "PAID" && (
              <button
                className="outline"
                disabled={payingId === order._id}
                onClick={() => pay(order)}
              >
                {payingId === order._id ? "Processing…" : "Make payment"}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default InventoryPage;

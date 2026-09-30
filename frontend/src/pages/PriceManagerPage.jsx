import React, { useState, useEffect } from "react";
import { getFoods, updateFoodPrice } from "../api/foodApi.js";

/**
 * Price Manager page — allows Managers to update food selling prices.
 * Props: session
 */
function PriceManagerPage({ session }) {
  const [foods, setFoods] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getFoods().then(setFoods);
  }, []);

  const save = async (food) => {
    const { ok } = await updateFoodPrice(
      food._id,
      food.sellingPrice,
      session.token
    );
    if (ok) setMessage(`${food.name} price updated.`);
    else setMessage("Unable to update price.");
  };

  return (
    <section>
      <div className="panel">
        <div className="section-head">
          <h2>Change food prices</h2>
          <span>Manager access</span>
        </div>
        {message && <div className="toast">✓ {message}</div>}
        {foods.map((food) => (
          <div className="row" key={food._id}>
            <div>
              <b>{food.name}</b>
              <small>Current selling price</small>
            </div>
            <input
              className="price-input"
              type="number"
              min="0"
              value={food.sellingPrice}
              onChange={(e) =>
                setFoods((items) =>
                  items.map((item) =>
                    item._id === food._id
                      ? { ...item, sellingPrice: e.target.value }
                      : item
                  )
                )
              }
            />
            <button className="outline" onClick={() => save(food)}>
              Save price
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PriceManagerPage;

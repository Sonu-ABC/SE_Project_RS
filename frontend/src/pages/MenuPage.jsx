import React from "react";
import { checkFoodAvailability } from "../api/foodApi.js";

// Food name → public image path mapping
const foodImages = {
  "Classic Veg Burger": "/images/classic-veg-burger.png",
  "Cheese Burst Pizza (8 inch)": "/images/cheese-burst-pizza.png",
  "Crispy French Fries": "/images/crispy-french-fries.png",
  "White Sauce Pasta": "/images/white-sauce-pasta.png",
  "Grilled Cheese Sandwich": "/images/grilled-cheese-sandwich.png",
  "Paneer Tikka Wrap": "/images/paneer-tikka-wrap.png",
  "Cheesy Garlic Bread": "/images/cheesy-garlic-bread.png",
  "Cold Coffee": "/images/cold-coffee.png",
  "Masala Chai": "/images/masala-chai.png",
  "Paneer Loaded Pizza (8 inch)": "/images/paneer-loaded-pizza.png",
};

/**
 * Menu page — displays the food grid, checks availability, and manages the cart bar.
 * Props: foods, add, cart, checkout, checkingFood, setMessage
 */
function MenuPage({ foods, add, cart, checkout, checkingFood }) {
  return (
    <section>
      <div className="hero">
        <div>
          <span className="pill">TODAY'S MENU</span>
          <h2>
            Good food, <em>good mood.</em>
          </h2>
          <p>Freshly prepared favourites, available while ingredients last.</p>
        </div>
        <div className="hero-art">🥗</div>
      </div>
      <div className="section-head">
        <h2>Dishes to choose from</h2>
        <span>{foods.length} items</span>
      </div>
      <div className="grid">
        {foods.map((f, i) => (
          <article className="food" key={f._id}>
            <div className={"foodpic p" + i}>
              {foodImages[f.name] ? (
                <img src={foodImages[f.name]} alt={f.name} />
              ) : (
                ["🍕", "🍝", "🍔"][i % 3]
              )}
              <div className="food-overlay">
                <div>
                  <strong>{f.name}</strong>
                  <span>Fresh kitchen special</span>
                </div>
                <b>₹{f.sellingPrice}</b>
              </div>
            </div>
            <button
              className="add"
              onClick={() => add(f)}
              disabled={checkingFood === f._id}
            >
              {checkingFood === f._id ? "Checking availability…" : "+ Add to order"}
            </button>
          </article>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="cartbar">
          <div>
            <b>{cart.length} items in cart</b>
            <span className="muted"> · Ingredients checked automatically</span>
          </div>
          <button type="button" className="primary" onClick={checkout}>
            Proceed to payment →
          </button>
        </div>
      )}
    </section>
  );
}

export default MenuPage;

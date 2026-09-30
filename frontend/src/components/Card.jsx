import React from "react";

/**
 * Reusable stat card used in Inventory and Reports.
 * Props: title (string), value (string|number), tone ("orange"|"green"|"red"|"yellow")
 */
function Card({ title, value, tone }) {
  return (
    <div className={"stat " + tone}>
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );
}

export default Card;

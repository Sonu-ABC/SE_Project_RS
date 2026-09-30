/**
 * Inventory API module — all fetch calls related to inventory and orders.
 */

export const getInventoryWarnings = async (token) => {
  const response = await fetch("/api/inventory/warnings", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const getIngredientOrders = async (token) => {
  const response = await fetch("/api/restaurant/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};

export const placeIngredientOrder = async (ingredientId, token) => {
  const response = await fetch("/api/restaurant/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ingredientId }),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

export const payIngredientOrder = async (orderId, token) => {
  const response = await fetch(`/api/restaurant/orders/${orderId}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

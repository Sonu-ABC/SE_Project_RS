/**
 * Food API module — all fetch calls related to the food/menu endpoints.
 */

export const getFoods = async () => {
  const response = await fetch("/api/foods");
  return response.json();
};

export const checkFoodAvailability = async (foodId) => {
  const response = await fetch(`/api/foods/${foodId}/availability`);
  const data = await response.json();
  return { ok: response.ok, data };
};

export const updateFoodPrice = async (foodId, sellingPrice, token) => {
  const response = await fetch(`/api/foods/${foodId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sellingPrice: Number(sellingPrice) }),
  });
  return { ok: response.ok };
};

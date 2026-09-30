/**
 * Bill API module — all fetch calls related to bill creation and payment.
 */

export const createBill = async (items, paymentMethod, token) => {
  const response = await fetch("/api/bills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, paymentMethod }),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

export const payBill = async (billId, token) => {
  const response = await fetch(`/api/bills/${billId}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

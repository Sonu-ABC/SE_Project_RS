/**
 * Account API module — fetch calls related to the restaurant account balance.
 */

export const getAccountBalance = async (token) => {
  const response = await fetch("/api/account/balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

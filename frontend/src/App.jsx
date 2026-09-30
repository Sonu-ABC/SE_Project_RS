import React, { useEffect, useState } from "react";
import MenuPage from "./pages/MenuPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import PriceManagerPage from "./pages/PriceManagerPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import BillsPage from "./pages/BillsPage.jsx";
import PaymentSummary from "./components/PaymentSummary.jsx";
import { getFoods } from "./api/foodApi.js";
import { checkFoodAvailability } from "./api/foodApi.js";
import { createBill, payBill } from "./api/billApi.js";
import { getAccountBalance } from "./api/accountApi.js";

/**
 * App — the main shell rendered after a user is authenticated.
 * Handles global state: foods, cart, active tab, balance, payment flow.
 * Props: session, onLogout
 */
function App({ session, onLogout }) {
  const [role] = useState(session.user.role);
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState("Menu");
  const [message, setMessage] = useState("");
  const [foods, setFoods] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paidBill, setPaidBill] = useState(null);
  const [checkingFood, setCheckingFood] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    getFoods()
      .then(setFoods)
      .catch(() => setMessage("Sorry, the menu could not be loaded."));
  }, []);

  useEffect(() => {
    if (role === "CUSTOMER") return;
    getAccountBalance(session.token)
      .then(({ ok, data }) => {
        if (!ok)
          throw new Error(data.message || "Unable to load restaurant balance");
        setBalance(data.balance || 0);
      })
      .catch((error) => setMessage(error.message));
  }, [role, session.token]);

  const add = async (f) => {
    setCheckingFood(f._id);
    setMessage("");
    try {
      const { ok, data } = await checkFoodAvailability(f._id);
      if (!ok || !data.available)
        return setMessage(
          data.message || "Sorry, this item is currently unavailable."
        );
      setCart((c) => [...c, { ...f, quantity: 1 }]);
      setMessage(`${f.name} added to cart`);
    } catch {
      setMessage(
        "Sorry, we could not check ingredient availability. Please make sure the backend is running."
      );
    } finally {
      setCheckingFood("");
    }
  };

  const checkout = () => {
    if (!cart.length)
      return setMessage(
        "Please add at least one item before proceeding to payment."
      );
    setCheckoutOpen(true);
    setMessage("Review your order and make payment below.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = async () => {
    setMessage("Processing payment...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const { ok: billOk, data: draft } = await createBill(
        cart.map((item) => ({ foodId: item._id, quantity: item.quantity })),
        "RAZORPAY",
        session.token
      );
      if (!billOk) throw new Error(draft.message || "Unable to create bill");
      const { ok: payOk, data: bill } = await payBill(draft._id, session.token);
      if (!payOk) throw new Error(bill.message || "Payment failed");
      setMessage("Payment successful. Your bill is saved and ready to download.");
      setPaidBill(bill);
      if (role !== "CUSTOMER") {
        const { data: account } = await getAccountBalance(session.token);
        setBalance(account.balance || 0);
      }
      setCheckoutOpen(false);
      setTab("Bills");
      setCart([]);
    } catch (error) {
      setMessage(`Sorry, payment could not be completed: ${error.message}`);
    }
  };

  // Navigation tabs per role
  const tabs =
    role === "MANAGER"
      ? ["Prices", "Reports"]
      : ["Menu", ...(role === "SALES_CLERK" ? ["Inventory"] : []), "Bills"];

  const tabIcon = (x) =>
    x === "Menu"
      ? "▦"
      : x === "Prices"
      ? "₹"
      : x === "Inventory"
      ? "◈"
      : x === "Orders"
      ? "↗"
      : x === "Reports"
      ? "◒"
      : "▤";

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span>🍽</span> Savoury
        </div>
        <p className="muted">RESTAURANT OS</p>
        <nav>
          {tabs.map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {tabIcon(x)} {x}
            </button>
          ))}
        </nav>
        <div className="rolebox">
          <small>VIEWING AS</small>
          <select disabled value={role}>
            <option>CUSTOMER</option>
            <option>SALES_CLERK</option>
            <option>MANAGER</option>
          </select>
          <button className="logout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">{role.replace("_", " ")} PORTAL</p>
            <h1>{tab}</h1>
          </div>
          {role !== "CUSTOMER" && (
            <div className="balance">
              <span>Restaurant balance</span>
              <strong>
                ₹{" "}
                {balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          )}
        </header>
        {message && <div className="toast">✓ {message}</div>}
        {checkoutOpen && <PaymentSummary cart={cart} pay={pay} />}
        {tab === "Menu" && (
          <MenuPage
            foods={foods}
            add={add}
            cart={cart}
            checkout={checkout}
            checkingFood={checkingFood}
          />
        )}
        {tab === "Inventory" && (
          <InventoryPage
            session={session}
            onBalanceChange={(updatedBalance) => setBalance(updatedBalance)}
          />
        )}
        {tab === "Prices" && <PriceManagerPage session={session} />}
        {tab === "Reports" && <ReportsPage />}
        {tab === "Bills" && <BillsPage paidBill={paidBill} />}
      </main>
    </div>
  );
}

export default App;

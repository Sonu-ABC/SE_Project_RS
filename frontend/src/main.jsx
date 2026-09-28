import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
function Root() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("restaurantSession") || "null"));
  if (!session) return <Auth onAuth={(data) => { localStorage.setItem("restaurantSession", JSON.stringify(data)); setSession(data); }} />;
  return <App session={session} onLogout={() => { localStorage.removeItem("restaurantSession"); setSession(null); }} />;
}
function Auth({ onAuth }) {
  const [mode, setMode] = useState("login"), [form, setForm] = useState({name:"",email:"",password:"",role:"CUSTOMER"}), [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setError(data.message || `Request failed (${response.status})`);
      if (mode === "register") { setMode("login"); setForm({name:"",email:form.email,password:"",role:"CUSTOMER"}); setError("Account created. Please sign in."); }
      else onAuth(data);
    } catch (error) {
      setError("Cannot connect to the backend. Start it with: npm run server");
    }
  };
  return <div className="auth-page"><div className="auth-card"><div className="brand auth-brand"><span>🍽</span> Savoury</div><p className="eyebrow">RESTAURANT OS</p><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p className="muted">{mode === "login" ? "Sign in to continue to your workspace." : "Join us and order your favourites."}</p><form onSubmit={submit}>{mode === "register" && <input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}<input type="email" placeholder="Email address" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input type="password" placeholder="Password" required minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>{mode === "register" && <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="CUSTOMER">Customer</option><option value="SALES_CLERK">Sales clerk</option><option value="MANAGER">Manager</option></select>}<button className="primary auth-submit">{mode === "login" ? "Sign in" : "Sign up"}</button></form>{error && <div className="toast">{error}</div>}<button className="link" onClick={()=>{setMode(mode === "login" ? "register" : "login");setError("")}}>{mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button></div></div>;
}
function App({ session, onLogout }) {
  const [role, setRole] = useState(session.user.role),
    [cart, setCart] = useState([]),
    [tab, setTab] = useState("Menu"),
    [message, setMessage] = useState(""), [foods, setFoods] = useState([]), [checkoutOpen, setCheckoutOpen] = useState(false), [paidBill, setPaidBill] = useState(null), [checkingFood, setCheckingFood] = useState(""), [balance, setBalance] = useState(0);
  useEffect(() => { fetch("/api/foods").then(r => r.json()).then(setFoods).catch(() => setMessage("Sorry, the menu could not be loaded.")); }, []);
  useEffect(() => {
    if (role === "CUSTOMER") return;
    fetch("/api/account/balance", { headers: { Authorization: `Bearer ${session.token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load restaurant balance");
        setBalance(data.balance || 0);
      })
      .catch((error) => setMessage(error.message));
  }, [role, session.token]);
  const add = async (f) => {
    setCheckingFood(f._id); setMessage("");
    try {
      const response = await fetch(`/api/foods/${f._id}/availability`); const result = await response.json();
      if (!response.ok || !result.available) return setMessage(result.message || "Sorry, this item is currently unavailable.");
      setCart((c) => [...c, { ...f, quantity: 1 }]); setMessage(`${f.name} added to cart`);
    } catch (error) { setMessage("Sorry, we could not check ingredient availability. Please make sure the backend is running."); }
    finally { setCheckingFood(""); }
  };
  const checkout = () => { if (!cart.length) return setMessage("Please add at least one item before proceeding to payment."); setCheckoutOpen(true); setMessage("Review your order and make payment below."); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const pay = async () => {
    setMessage("Processing payment...");
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const headers = {"Content-Type":"application/json", Authorization:`Bearer ${session.token}`};
      const billResponse = await fetch("/api/bills", {method:"POST", headers, body:JSON.stringify({items:cart.map(item=>({foodId:item._id,quantity:item.quantity})), paymentMethod:"RAZORPAY"})});
      const draft = await billResponse.json();
      if (!billResponse.ok) throw new Error(draft.message || "Unable to create bill");
      const paymentResponse = await fetch(`/api/bills/${draft._id}/pay`, {method:"POST", headers});
      const bill = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(bill.message || "Payment failed");
      setMessage("Payment successful. Your bill is saved and ready to download."); setPaidBill(bill); if (role !== "CUSTOMER") { const accountResponse=await fetch("/api/account/balance",{headers}); const account=await accountResponse.json(); setBalance(account.balance || 0); } setCheckoutOpen(false); setTab("Bills"); setCart([]);
    } catch (error) { setMessage(`Sorry, payment could not be completed: ${error.message}`); }
  };
  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span>🍽</span> Savoury
        </div>
        <p className="muted">RESTAURANT OS</p>
        <nav>
          {(role === "MANAGER" ? ["Prices", "Reports"] : ["Menu", ...(role === "SALES_CLERK" ? ["Inventory"] : []), "Bills"]).map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x === "Menu"
                ? "▦"
                : x === "Prices"
                  ? "₹"
                : x === "Inventory"
                  ? "◈"
                  : x === "Orders"
                    ? "↗"
                    : x === "Reports"
                      ? "◒"
                      : "▤"}{" "}
              {x}
            </button>
          ))}
        </nav>
        <div className="rolebox">
          <small>VIEWING AS</small>
          <select disabled
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setTab("Menu");
            }}
          >
            <option>CUSTOMER</option>
            <option>SALES_CLERK</option>
            <option>MANAGER</option>
          </select><button className="logout" onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">{role.replace("_", " ")} PORTAL</p>
            <h1>{tab}</h1>
          </div>
          {role !== "CUSTOMER" && <div className="balance">
            <span>Restaurant balance</span>
            <strong>₹ {balance.toLocaleString("en-IN", {minimumFractionDigits:2})}</strong>
          </div>}
        </header>
        {message && <div className="toast">✓ {message}</div>}
        {checkoutOpen && <PaymentSummary cart={cart} pay={pay} />}
        {tab === "Menu" && (
          <Menu foods={foods} add={add} cart={cart} checkout={checkout} checkingFood={checkingFood} />
        )}{" "}
        {tab === "Inventory" && <Inventory session={session} onBalanceChange={(updatedBalance)=>setBalance(updatedBalance)} />}
        {tab === "Prices" && <PriceManager session={session} />}
        {tab === "Reports" && <Reports />}
        {tab === "Bills" && <Bills paidBill={paidBill} />}
      </main>
    </div>
  );
}
function Menu({ foods, add, cart, checkout, checkingFood }) {
  const foodImages = { "Classic Veg Burger":"/images/classic-veg-burger.png", "Cheese Burst Pizza (8 inch)":"/images/cheese-burst-pizza.png", "Crispy French Fries":"/images/crispy-french-fries.png", "White Sauce Pasta":"/images/white-sauce-pasta.png", "Grilled Cheese Sandwich":"/images/grilled-cheese-sandwich.png", "Paneer Tikka Wrap":"/images/paneer-tikka-wrap.png", "Cheesy Garlic Bread":"/images/cheesy-garlic-bread.png", "Cold Coffee":"/images/cold-coffee.png", "Masala Chai":"/images/masala-chai.png", "Paneer Loaded Pizza (8 inch)":"/images/paneer-loaded-pizza.png" };
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
              {foodImages[f.name] ? <img src={foodImages[f.name]} alt={f.name} /> : ["🍕", "🍝", "🍔"][i % 3]}
              <div className="food-overlay">
                <div>
                  <strong>{f.name}</strong>
                  <span>Fresh kitchen special</span>
                </div>
                <b>₹{f.sellingPrice}</b>
              </div>
            </div>
            <button className="add" onClick={() => add(f)} disabled={checkingFood === f._id}>
              {checkingFood === f._id ? "Checking availability…" : "+ Add to order"}
            </button>
          </article>
        ))}
      </div>
      {cart.length > 0 && <div className="cartbar">
        <div>
          <b>{cart.length} items in cart</b>
          <span className="muted"> · Ingredients checked automatically</span>
        </div>
        <button type="button" className="primary" onClick={checkout}>
          Proceed to payment →
        </button>
      </div>}
    </section>
  );
}
function PaymentSummary({ cart, pay }) {
  const total = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const [loading, setLoading] = useState(false);
  const makePayment = async () => { setLoading(true); await pay(); };
  return <div className="payment-summary"><div className="payment-details"><p className="eyebrow">ORDER SUMMARY</p><h2>Items you are buying</h2><div className="checkout-items">{cart.map((item, index) => <div className="checkout-item" key={`${item._id}-${index}`}><span>{item.name} <small>× {item.quantity}</small></span><strong>₹{(item.sellingPrice * item.quantity).toFixed(2)}</strong></div>)}</div><h2>Total amount</h2><strong className="total">₹{total.toFixed(2)}</strong></div><button className="primary" disabled={loading} onClick={makePayment}>{loading ? <span className="spinner"></span> : "Make Payment"}</button></div>;
}
function Inventory({ session, onBalanceChange }) {
  const [ingredients, setIngredients] = useState([]), [orders, setOrders] = useState([]), [payingId, setPayingId] = useState("");
  const [error, setError] = useState("");
  const load = () => { const headers={Authorization:`Bearer ${session.token}`}; Promise.all([fetch("/api/inventory/warnings",{headers}),fetch("/api/restaurant/orders",{headers})]).then(async ([a,b])=>{setIngredients(await a.json());setOrders(await b.json())}).catch(e=>setError(e.message)); };
  useEffect(load, [session.token]);
  const place = async (ingredient) => { const r=await fetch("/api/restaurant/orders",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.token}`},body:JSON.stringify({ingredientId:ingredient._id})}); if(!r.ok)setError((await r.json()).message); else load(); };
  const pay = async (order) => { setPayingId(order._id); setError(""); try { const headers={Authorization:`Bearer ${session.token}`}; const r=await fetch(`/api/restaurant/orders/${order._id}/pay`,{method:"POST",headers}); const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.message || `Payment failed (${r.status})`); const balanceResponse=await fetch("/api/account/balance",{headers}); const account=await balanceResponse.json(); onBalanceChange?.(account.balance); load(); } catch(e) { setError(e.message); } finally { setPayingId(""); } };

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
                  {ingredient.currentStock} {ingredient.unit} remaining · threshold {ingredient.calculatedThreshold}
                </small>
              </div>
              <button className="outline" onClick={()=>place(ingredient)}>Place order</button>
            </div>
          ))}
      </div>
      <div className="panel"><div className="section-head"><h2>Ingredient orders</h2><span>Pending payment</span></div>{orders.map(order=><div className="row" key={order._id}><div><b>{order.ingredientName}</b><small>{order.quantity} units · ₹{order.amount}</small></div><span className="status pending">{order.status}</span>{order.status !== "PAID" && <button className="outline" disabled={payingId===order._id} onClick={()=>pay(order)}>{payingId===order._id ? "Processing…" : "Make payment"}</button>}</div>)}</div>
    </section>
  );
}
function PriceManager({ session }) {
  const [foods, setFoods] = useState([]), [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/foods").then(r=>r.json()).then(setFoods); }, []);
  const save = async (food) => { const r=await fetch(`/api/foods/${food._id}`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.token}`},body:JSON.stringify({sellingPrice:Number(food.sellingPrice)})}); if(r.ok)setMessage(`${food.name} price updated.`); else setMessage("Unable to update price."); };
  return <section><div className="panel"><div className="section-head"><h2>Change food prices</h2><span>Manager access</span></div>{message&&<div className="toast">✓ {message}</div>}{foods.map(food=><div className="row" key={food._id}><div><b>{food.name}</b><small>Current selling price</small></div><input className="price-input" type="number" min="0" value={food.sellingPrice} onChange={e=>setFoods(items=>items.map(item=>item._id===food._id?{...item,sellingPrice:e.target.value}:item))}/><button className="outline" onClick={()=>save(food)}>Save price</button></div>)}</div></section>;
}
function Reports() {
  return (
    <section>
      <div className="cards">
        <Card title="Total sales" value="₹ 1,24,850" tone="green" />
        <Card title="Gross profit" value="₹ 48,200" tone="yellow" />
        <Card title="Expenses" value="₹ 76,650" tone="red" />
      </div>
      <div className="panel chart">
        <div className="section-head">
          <h2>Monthly sales</h2>
          <span>Last 6 months</span>
        </div>
        <div className="bars">
          {[45, 62, 55, 78, 68, 92].map((n, i) => (
            <div key={i}>
              <span style={{ height: n + "%" }}></span>
              <small>{["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i]}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="report-charts"><div className="panel chart"><div className="section-head"><h2>Monthly profit</h2><span>Last 6 months</span></div><div className="bars profit-bars">{[35,48,42,61,54,76].map((n,i)=><div key={i}><span style={{height:n+"%"}}></span><small>{["Apr","May","Jun","Jul","Aug","Sep"][i]}</small></div>)}</div></div><div className="panel chart"><div className="section-head"><h2>Monthly expenses</h2><span>Last 6 months</span></div><div className="bars expense-bars">{[60,52,67,48,62,55].map((n,i)=><div key={i}><span style={{height:n+"%"}}></span><small>{["Apr","May","Jun","Jul","Aug","Sep"][i]}</small></div>)}</div></div></div>
    </section>
  );
}
function Bills({ paidBill }) {
  return (
    <section>
      {paidBill && <div className="panel new-bill"><div><b>{paidBill.billNumber}</b><small>Latest online order · Payment successful</small></div><strong>₹{paidBill.totalAmount.toFixed(2)}</strong><button className="primary" onClick={() => { const blob=new Blob([`SAVOURY RESTAURANT\nBill: ${paidBill.billNumber}\nTotal: ₹${paidBill.totalAmount.toFixed(2)}\nThank you!`],{type:"text/plain"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${paidBill.billNumber}.txt`; a.click(); URL.revokeObjectURL(url); }}>Download bill</button></div>}
      <div className="panel">
        <div className="section-head">
          <h2>Recent bills</h2>
          <span>Stored securely</span>
        </div>
        {["B-2048", "B-2047", "B-2046"].map((x, i) => (
          <div className="row" key={x}>
            <div>
              <b>{x}</b>
              <small>
                {i ? "Walk-in sale" : "Online order"} · Today, 10:{20 + i}
              </small>
            </div>
            <strong>₹{[600, 480, 320][i]}</strong>
            <span className="status paid">PAID</span>
            <button className="outline">Get bill</button>
          </div>
        ))}
      </div>
    </section>
  );
}
function Card({ title, value, tone }) {
  return (
    <div className={"stat " + tone}>
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<Root />);

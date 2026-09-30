import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import AuthPage from "./pages/AuthPage.jsx";
import App from "./App.jsx";

/**
 * Root — session manager. Renders AuthPage when not logged in,
 * App when a session exists (stored in localStorage).
 */
function Root() {
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem("restaurantSession") || "null")
  );

  if (!session)
    return (
      <AuthPage
        onAuth={(data) => {
          localStorage.setItem("restaurantSession", JSON.stringify(data));
          setSession(data);
        }}
      />
    );

  return (
    <App
      session={session}
      onLogout={() => {
        localStorage.removeItem("restaurantSession");
        setSession(null);
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(<Root />);

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Import 2 file con
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", background: "#0f2027", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>Đang tải...</div>;

  return (
    <Router>
      <Routes>
        {/* Chưa đăng nhập -> Hiện Auth. Rồi -> Hiện Dashboard */}
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
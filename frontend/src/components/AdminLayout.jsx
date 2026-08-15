import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./admin.css";

export default function AdminLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div>
          <button className="admin-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="admin-main">
        <div className="admin-sidebar"><Sidebar /></div>
        <div className="admin-content">{children}</div>
      </div>

      <Footer />
    </div>
  );
}

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
        <div className="admin-brand">
          <span className="admin-brand-mark" aria-hidden="true">R</span>
          <div>
            <span className="admin-eyebrow">RELIFENOTIFY · RESPONSE OPERATIONS</span>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div>
          <span className="admin-role-label">Administrator</span>
          <button className="admin-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <div className="admin-main">
        <aside className="admin-sidebar"><Sidebar /></aside>
        <div className="admin-content">{children}</div>
      </div>

      <Footer />
    </div>
  );
}

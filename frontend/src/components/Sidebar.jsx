import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { label: "Dashboard", to: "/admin" },
  { label: "Incident Management", to: "/incident-management" },
  { label: "Relief Requests", to: "/admin-relief-requests" },
  { label: "Evacuation Centers", to: "/admin-evacuation-centers" },
  { label: "Supply Inventory", to: "/admin-supply-inventory" },
  { label: "Alert Broadcasting", to: "/alert-broadcasting" },
  { label: "Reports", to: "/reports-security" },
  { label: "Account Settings", to: "/account-settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#064e3b" }}>Admin</h3>
        <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#6b7280" }}>Control panel</p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l) => {
          const active = location.pathname === l.to || location.pathname.startsWith(l.to + "/");
          return (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className={"sidebar-link" + (active ? " active" : "")}
            >
              <span style={{ width: 8, height: 8, borderRadius: 8, background: active ? "var(--admin-success)" : "#cbd5e1" }} />
              <span>{l.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

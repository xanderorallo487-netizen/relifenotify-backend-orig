import React from "react";
import { Link, useLocation } from "react-router-dom";

const StaffNavbar = () => {

  const location = useLocation();

  const navItems = [
    ["/staff", "⌂", "Command Center"],
    ["/incident-reports", "!", "Incident Reports"],
    ["/evacuation-centers", "⌂", "Evacuation"],
    ["/relief-requests", "+", "Relief Requests"],
    ["/local-announcements", "◉", "Announcements"],
    ["/incident-history", "↺", "Incident History"],
    ["/community-needs-assessment", "⌁", "Needs Assessment"],
    ["/rescue-response-coordination", "✦", "Rescue Response"],
    ["/volunteer-personnel-management", "♧", "Volunteers"],
    ["/supply-inventory-monitoring", "▦", "Supply Inventory"],
    ["/evacuee-attendance-tracking", "✓", "Evacuees"]
  ];

  const navStyle = (path) => ({
    color: location.pathname === path ? "#092f2b" : "#d1e4df",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: "8px",
    transition: "0.2s ease",
    fontWeight: location.pathname === path ? "800" : "600",
    fontSize: "13px",
    background: location.pathname === path ? "#d8f36b" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    whiteSpace: "nowrap"
  });

  return (

    <aside
      style={{
        background: "#103d38",
        padding: "22px 14px",
        width: "236px",
        minWidth: "236px",
        minHeight: "calc(100vh - 91px)",
        boxSizing: "border-box",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        float: "left"
      }}
    >
      <div style={{ padding: "0 10px 18px", color: "#86a9a1", fontSize: "10px", fontWeight: "800", letterSpacing: "1.6px" }}>
        STAFF OPERATIONS
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        {navItems.map(([path, icon, label]) => (
          <Link key={path} to={path} style={navStyle(path)}>
            <span style={{ width: "20px", textAlign: "center", fontSize: "16px", lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div style={{ margin: "24px 8px 0", padding: "13px", borderTop: "1px solid rgba(255,255,255,0.12)", color: "#a9c7c0", fontSize: "11px", lineHeight: "1.5" }}>
        <strong style={{ color: "#d8f36b", display: "block", fontSize: "10px", letterSpacing: "1px" }}>SYSTEM STATUS</strong>
        All response channels operational
      </div>
    </aside>

  );

};

export default StaffNavbar;
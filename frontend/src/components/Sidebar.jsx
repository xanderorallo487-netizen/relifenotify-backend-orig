import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { label: "Dashboard", to: "/admin" },
  { label: "Incident Management", to: "/incident-management" },
  { label: "Relief Requests", to: "/admin-relief-requests" },
  { label: "Relief Operations", to: "/relief-operations" },
  { label: "Beneficiaries", to: "/beneficiary-verification" },
  { label: "Evacuation Centers", to: "/admin-evacuation-centers" },
  { label: "Supply Inventory", to: "/admin-supply-inventory" },
  { label: "Alert Broadcasting", to: "/alert-broadcasting" },
  { label: "Reports & Security", to: "/reports-security" },
  { label: "Audit Logs", to: "/audit-logs" },
  { label: "Account Settings", to: "/account-settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="admin-navigation">
      <div className="admin-navigation-heading">
        <h2>Workspace</h2>
        <p>Manage response operations</p>
      </div>

      <nav aria-label="Administrator navigation">
        {links.map((l) => {
          const active = location.pathname === l.to || location.pathname.startsWith(l.to + "/");
          return (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              aria-current={active ? "page" : undefined}
              className={"sidebar-link" + (active ? " active" : "")}
            >
              <span className="sidebar-indicator" aria-hidden="true" />
              <span>{l.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="admin-sidebar-note">
        <span className="admin-status-dot" />
        <div><strong>Response network</strong><span>Monitoring active</span></div>
      </div>
    </div>
  );
}

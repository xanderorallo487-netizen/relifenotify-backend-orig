import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import IncidentMap from "../components/IncidentMap";

function AdminDashboard() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageForm, setMessageForm] = useState({
    receiver_id: "",
    message: "",
  });

  useEffect(() => {
    fetchIncidents();
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data } = await api.get("/incidents");
      if (data.success) setIncidents(data.incidents);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/admin-messages");
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      const admin = JSON.parse(localStorage.getItem("user"));

      await api.post("/admin-messages", {
        sender_id: admin.id,
        sender_name: admin.full_name,
        receiver_id: messageForm.receiver_id,
        message: messageForm.message,
      });

      setMessageForm({ receiver_id: "", message: "" });
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/users/${id}`, { status });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const total = incidents.length;
  const ongoing = incidents.filter(
    (i) => i.status?.toLowerCase() === "ongoing"
  ).length;
  const resolved = incidents.filter(
    (i) => i.status?.toLowerCase() === "resolved"
  ).length;
  const barangays = new Set(
    incidents.map((i) => i.barangay).filter(Boolean)
  ).size;

  const responders = users.filter(
    (u) => u.role?.toLowerCase() !== "admin"
  );

  return (
    <AdminLayout
      title="ReLifeNotify Admin Dashboard"
      subtitle="Incident monitoring and response coordination"
    >
      <main className="admin-dashboard">

        {/* TOP BAR */}
        <header className="dashboard-topbar">
          <div>
            <span className="section-label">OVERVIEW</span>
            <h1>Command Center</h1>
          </div>

          <div className="topbar-right">
            <div className="system-status">
              <span className="status-dot" />
              System Operational
            </div>

            <button className="logout-btn" onClick={logout}>
              Sign Out
            </button>
          </div>
        </header>

        {/* INTRO */}
        <div className="dashboard-intro">
          <div>
            <h2>Incident Overview</h2>
            <p>
              Monitor reported incidents, affected areas and response activity.
            </p>
          </div>

          <div className="incident-count">
            <strong>{total}</strong>
            <span>Total Reports</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats">
          <Stat
            label="Total Incidents"
            value={total}
            description="All recorded reports"
            type="default"
          />

          <Stat
            label="Ongoing"
            value={ongoing}
            description="Currently requiring attention"
            type="warning"
          />

          <Stat
            label="Resolved"
            value={resolved}
            description="Successfully closed"
            type="success"
          />

          <Stat
            label="Affected Barangays"
            value={barangays}
            description="Locations with incidents"
            type="info"
          />
        </div>

        {/* MAIN MONITORING AREA */}
        <section className="monitoring-card">

          <div className="card-heading">
            <div>
              <span className="section-label">LIVE MONITORING</span>
              <h2>Incident Map</h2>
              <p>Current location of reported incidents.</p>
            </div>

            <div className="map-legend">
              <span>
                <i className="legend-red" />
                Incident
              </span>

              <span>
                <i className="legend-green" />
                Operational
              </span>
            </div>
          </div>

          <div className="map">
            {loading ? (
              <div className="loading">Loading incident data...</div>
            ) : (
              <IncidentMap incidents={incidents} />
            )}
          </div>
        </section>

        {/* LOWER AREA */}
        <div className="dashboard-grid">

          {/* DISPATCH */}
          <section className="content-card dispatch-card">

            <div className="card-heading compact">
              <div>
                <span className="section-label">COMMUNICATIONS</span>
                <h2>Staff Dispatch</h2>
                <p>Send instructions to staff and responders.</p>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="dispatch-form">

              <label>
                Recipient
                <select
                  value={messageForm.receiver_id}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      receiver_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select staff member</option>

                  {responders.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role || "user"})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Message
                <textarea
                  rows="3"
                  placeholder="Enter operational instructions..."
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      message: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <button className="send-btn" type="submit">
                Send Dispatch
                <span>→</span>
              </button>

            </form>

            <div className="history">

              <div className="history-head">
                <div>
                  <h3>Recent Dispatches</h3>
                  <small>Latest administrator messages</small>
                </div>

                <b>{messages.length}</b>
              </div>

              <div className="message-list">
                {messages.length === 0 ? (
                  <div className="empty">No dispatches yet.</div>
                ) : (
                  messages.map((msg) => (
                    <div className="message" key={msg.message_id}>
                      <strong>
                        <span />
                        To {msg.receiver_name}
                      </strong>

                      <p>{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </section>

          {/* USERS */}
          <section className="content-card users-card">

            <div className="card-heading compact">
              <div>
                <span className="section-label">ACCESS CONTROL</span>
                <h2>User Accounts</h2>
                <p>Manage operational account access.</p>
              </div>

              <b className="count">{users.length}</b>
            </div>

            <div className="users">

              {users.length === 0 ? (
                <div className="empty">
                  No user accounts found.
                </div>
              ) : (
                users.map((user) => {
                  const active =
                    user.status?.toLowerCase() === "active";

                  return (
                    <div className="user" key={user.id}>

                      <div className="avatar">
                        {user.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="user-info">
                        <strong>{user.full_name}</strong>
                        <small>{user.email}</small>
                      </div>

                      <span className="role">
                        {user.role || "USER"}
                      </span>

                      <span
                        className={`status ${
                          active ? "active" : "inactive"
                        }`}
                      >
                        {user.status || "Unknown"}
                      </span>

                      <div className="actions">

                        <button
                          onClick={() =>
                            updateStatus(user.id, "Active")
                          }
                        >
                          Activate
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(user.id, "Inactive")
                          }
                        >
                          Deactivate
                        </button>

                        {user.role !== "admin" && (
                          <button
                            className="delete"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        )}

                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </section>
        </div>

      </main>
    </AdminLayout>
  );
}

function Stat({
  label,
  value,
  description,
  type = "default",
}) {
  return (
    <div className={`stat ${type}`}>

      <div className="stat-top">
        <span>{label}</span>
        <i />
      </div>

      <strong>{value}</strong>

      <small>{description}</small>

    </div>
  );
}

const styles = `
/* =========================================================
   RELIFENOTIFY — ADMIN COMMAND CENTER
   Visual design only
   ========================================================= */

.admin-dashboard {
  min-height: 100%;
  padding: 28px clamp(20px, 3vw, 44px) 42px;
  background:
    radial-gradient(circle at top right, rgba(12, 112, 70, .045), transparent 32%),
    #f4f7f5;
  color: #17231e;
}

/* =========================================================
   TOP BAR
   ========================================================= */

.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.section-label {
  display: block;
  margin-bottom: 6px;
  color: #087443;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.dashboard-topbar h1 {
  margin: 0;
  color: #13201a;
  font-size: 27px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -.7px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #dbe5df;
  border-radius: 9px;
  background: rgba(255,255,255,.8);
  color: #4c5b53;
  font-size: 10px;
  font-weight: 750;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0a9255;
  box-shadow: 0 0 0 3px #e4f4eb;
}

.logout-btn {
  border: 0;
  border-radius: 8px;
  padding: 10px 15px;
  background: #087443;
  color: #fff;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
  transition: .18s ease;
}

.logout-btn:hover {
  background: #065d36;
  transform: translateY(-1px);
}

/* =========================================================
   INTRO
   ========================================================= */

.dashboard-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 15px;
}

.dashboard-intro h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -.25px;
}

.dashboard-intro p {
  margin: 5px 0 0;
  color: #748079;
  font-size: 11px;
}

.incident-count {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 7px;
  background: #eaf4ee;
}

.incident-count strong {
  color: #087443;
  font-size: 12px;
}

.incident-count span {
  color: #627168;
  font-size: 9px;
  font-weight: 700;
}

/* =========================================================
   STATISTICS
   ========================================================= */

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.stat {
  position: relative;
  min-height: 103px;
  padding: 15px 16px;
  overflow: hidden;
  border: 1px solid #dce5df;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(22, 54, 39, .035);
}

.stat::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #294d3e;
}

.stat.warning::before {
  background: #df8617;
}

.stat.success::before {
  background: #087443;
}

.stat.info::before {
  background: #3774df;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-top span {
  color: #6e7b74;
  font-size: 10px;
  font-weight: 750;
}

.stat-top i {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #edf0f1;
}

.stat.warning .stat-top i {
  background: #fff0df;
}

.stat.success .stat-top i {
  background: #e3f4eb;
}

.stat.info .stat-top i {
  background: #e7edff;
}

.stat strong {
  display: block;
  margin-top: 8px;
  color: #18251f;
  font-size: 27px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -.7px;
}

.stat small {
  display: block;
  margin-top: 6px;
  color: #8a958f;
  font-size: 9px;
}

/* =========================================================
   MAIN MONITORING CARD
   ========================================================= */

.monitoring-card,
.content-card {
  border: 1px solid #dce5df;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(25, 55, 41, .035);
}

.monitoring-card {
  padding: 18px;
  margin-bottom: 15px;
}

.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 13px;
}

.card-heading.compact {
  margin-bottom: 15px;
}

.card-heading h2 {
  margin: 0;
  color: #18251f;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -.2px;
}

.card-heading p {
  margin: 4px 0 0;
  color: #7b8781;
  font-size: 10px;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-top: 4px;
}

.map-legend span {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6d7973;
  font-size: 9px;
}

.map-legend i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.legend-red {
  background: #dc3030;
}

.legend-green {
  background: #0a9255;
}

.map {
  height: 300px;
  overflow: hidden;
  border: 1px solid #dce5df;
  border-radius: 9px;
  background: #eef3ef;
}

.loading {
  height: 100%;
  display: grid;
  place-items: center;
  color: #78857e;
  font-size: 11px;
}

/* =========================================================
   LOWER GRID
   ========================================================= */

.dashboard-grid {
  display: grid;
  grid-template-columns: .9fr 1.1fr;
  gap: 15px;
}

.content-card {
  min-width: 0;
  padding: 18px;
}

/* =========================================================
   DISPATCH
   ========================================================= */

.dispatch-form {
  display: grid;
  gap: 10px;
}

.dispatch-form label {
  display: block;
  color: #56645c;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .7px;
  text-transform: uppercase;
}

.dispatch-form select,
.dispatch-form textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 5px;
  border: 1px solid #d5dfd9;
  border-radius: 7px;
  background: #fafcfb;
  color: #26352d;
  font-family: inherit;
  font-size: 11px;
  outline: none;
  transition: .18s ease;
}

.dispatch-form select {
  height: 35px;
  padding: 0 9px;
}

.dispatch-form textarea {
  min-height: 72px;
  padding: 9px;
  resize: none;
}

.dispatch-form select:focus,
.dispatch-form textarea:focus {
  border-color: #0a9255;
  box-shadow: 0 0 0 3px rgba(10,146,85,.08);
  background: #fff;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 0;
  border-radius: 7px;
  padding: 10px 12px;
  background: #087443;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition: .18s ease;
}

.send-btn:hover {
  background: #065d36;
}

.send-btn span {
  font-size: 14px;
}

/* =========================================================
   DISPATCH HISTORY
   ========================================================= */

.history {
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1px solid #edf1ee;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-head h3 {
  margin: 0;
  color: #29372f;
  font-size: 11px;
  font-weight: 800;
}

.history-head small {
  display: block;
  margin-top: 2px;
  color: #929c97;
  font-size: 8px;
}

.history-head b,
.count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 23px;
  height: 23px;
  box-sizing: border-box;
  border-radius: 6px;
  background: #eaf4ee;
  color: #087443;
  font-size: 9px;
}

.message-list {
  max-height: 145px;
  overflow-y: auto;
  padding-right: 2px;
}

.message-list::-webkit-scrollbar,
.users::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-thumb,
.users::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #cbd8d0;
}

.message {
  padding: 8px 9px;
  margin-bottom: 6px;
  border: 1px solid #e4ebe6;
  border-radius: 7px;
  background: #fafcfb;
}

.message:last-child {
  margin-bottom: 0;
}

.message strong {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #44534b;
  font-size: 9px;
}

.message strong span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0a9255;
}

.message p {
  margin: 4px 0 0;
  color: #727e78;
  font-size: 10px;
  line-height: 1.45;
}

/* =========================================================
   USERS
   ========================================================= */

.users {
  max-height: 305px;
  overflow-y: auto;
  padding-right: 3px;
}

.user {
  display: grid;
  grid-template-columns: 31px minmax(100px, 1fr) auto auto auto;
  align-items: center;
  gap: 9px;
  padding: 9px 0;
  border-bottom: 1px solid #edf1ee;
}

.user:last-child {
  border-bottom: 0;
}

.avatar {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border-radius: 8px;
  background: #e7f2ec;
  color: #087443;
  font-size: 10px;
  font-weight: 850;
}

.user-info {
  min-width: 0;
}

.user-info strong,
.user-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info strong {
  color: #26352d;
  font-size: 10px;
  font-weight: 750;
}

.user-info small {
  margin-top: 2px;
  color: #8a9690;
  font-size: 8px;
}

.role,
.status {
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 7px;
  font-weight: 850;
  letter-spacing: .3px;
  text-transform: uppercase;
}

.role {
  background: #f0f3f1;
  color: #68756e;
}

.status.active {
  background: #e6f5ec;
  color: #087443;
}

.status.inactive {
  background: #fff1dd;
  color: #b76c0b;
}

.actions {
  display: flex;
  gap: 4px;
}

.actions button {
  border: 1px solid #d2e0d7;
  border-radius: 5px;
  padding: 5px 6px;
  background: #f6faf7;
  color: #087443;
  font-size: 7px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s ease;
}

.actions button:hover {
  background: #e7f3ec;
}

.actions .delete {
  border-color: #edd0d0;
  background: #fff8f8;
  color: #b42318;
}

.actions .delete:hover {
  background: #ffeded;
}

/* =========================================================
   EMPTY
   ========================================================= */

.empty {
  padding: 18px;
  border: 1px dashed #d8e2dc;
  border-radius: 7px;
  text-align: center;
  color: #89958f;
  font-size: 10px;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .map {
    height: 290px;
  }
}

@media (max-width: 700px) {
  .admin-dashboard {
    padding: 20px 15px 30px;
  }

  .dashboard-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-intro {
    align-items: flex-start;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .monitoring-card,
  .content-card {
    padding: 14px;
  }

  .map {
    height: 250px;
  }

  .map-legend {
    display: none;
  }

  .user {
    grid-template-columns: 31px 1fr auto;
  }

  .user .role,
  .user .status {
    display: none;
  }

  .actions {
    grid-column: 2 / -1;
  }
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .dashboard-intro {
    display: block;
  }

  .incident-count {
    width: fit-content;
    margin-top: 10px;
  }
}
`;

export default function AdminDashboardWithStyles() {
  return (
    <>
      <style>{styles}</style>
      <AdminDashboard />
    </>
  );
}
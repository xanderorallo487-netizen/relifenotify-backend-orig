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

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">OPERATIONS</span>
            <h1>Command Center</h1>
            <p>
              Monitor incidents, coordinate personnel and manage system access.
            </p>
          </div>

          <div className="system-status">
            <span /> System Operational
          </div>
        </header>

        {/* STATS */}
        <div className="stats">
          <Stat label="Total Incidents" value={total} />
          <Stat label="Ongoing" value={ongoing} type="warning" />
          <Stat label="Resolved" value={resolved} type="success" />
          <Stat label="Affected Barangays" value={barangays} type="info" />
        </div>

        {/* MAP */}
        <section className="panel map-panel">
          <PanelTitle
            eyebrow="LIVE MONITORING"
            title="Incident Map"
            text="Current location of reported incidents."
          />

          <div className="map">
            {loading ? (
              <div className="loading">Loading incident data...</div>
            ) : (
              <IncidentMap incidents={incidents} />
            )}
          </div>
        </section>

        {/* LOWER GRID */}
        <div className="dashboard-grid">

          {/* DISPATCH */}
          <section className="panel">
            <PanelTitle
              eyebrow="COMMUNICATIONS"
              title="Staff Dispatch"
              text="Send instructions to staff and responders."
            />

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
                        <span /> To {msg.receiver_name}
                      </strong>
                      <p>{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* USERS */}
          <section className="panel">
            <PanelTitle
              eyebrow="ACCESS CONTROL"
              title="User Accounts"
              text="Manage operational account access."
              count={users.length}
            />

            <div className="users">
              {users.length === 0 ? (
                <div className="empty">No user accounts found.</div>
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

                      <span className={`status ${active ? "active" : "inactive"}`}>
                        {user.status || "Unknown"}
                      </span>

                      <div className="actions">
                        <button onClick={() => updateStatus(user.id, "Active")}>
                          Activate
                        </button>

                        <button onClick={() => updateStatus(user.id, "Inactive")}>
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

function Stat({ label, value, type = "default" }) {
  return (
    <div className={`stat ${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelTitle({ eyebrow, title, text, count }) {
  return (
    <div className="panel-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      {count !== undefined && <b className="count">{count}</b>}
    </div>
  );
}

const styles = `
.admin-dashboard {
  padding: 24px clamp(18px, 3vw, 42px) 40px;
  background: #f5f8f6;
  color: #1d2b25;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 20px;
}

.eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #087443;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.dashboard-header p {
  margin: 6px 0 0;
  color: #6b7871;
  font-size: 13px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  background: #fff;
  border: 1px solid #dce6e0;
  border-radius: 6px;
  color: #53635b;
  font-size: 11px;
  font-weight: 700;
}

.system-status span,
.message strong span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0a8f55;
}

/* STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat {
  position: relative;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #dce6e0;
  border-radius: 8px;
  border-left: 3px solid #31584a;
}

.stat.warning {
  border-left-color: #e28a18;
}

.stat.success {
  border-left-color: #087443;
}

.stat.info {
  border-left-color: #477b69;
}

.stat span {
  display: block;
  color: #738078;
  font-size: 11px;
  font-weight: 700;
}

.stat strong {
  display: block;
  margin-top: 6px;
  color: #18251f;
  font-size: 27px;
  line-height: 1;
}

/* PANELS */
.panel {
  padding: 20px;
  background: #fff;
  border: 1px solid #dce6e0;
  border-radius: 9px;
  box-shadow: 0 1px 3px rgba(20, 50, 38, .03);
}

.map-panel {
  margin-bottom: 16px;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 14px;
}

.panel-title h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 750;
  color: #1c2b24;
}

.panel-title p {
  margin: 4px 0 0;
  color: #78847e;
  font-size: 12px;
}

.count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: #edf5f0;
  color: #087443;
  border-radius: 5px;
  font-size: 11px;
}

/* MAP */
.map {
  height: 320px;
  overflow: hidden;
  border: 1px solid #dce6e0;
  border-radius: 7px;
  background: #f1f5f2;
}

.loading {
  height: 100%;
  display: grid;
  place-items: center;
  color: #718078;
  font-size: 12px;
}

/* LOWER GRID */
.dashboard-grid {
  display: grid;
  grid-template-columns: .9fr 1.1fr;
  gap: 16px;
}

/* FORM */
.dispatch-form {
  display: grid;
  gap: 12px;
}

.dispatch-form label {
  color: #4d5b54;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .5px;
  text-transform: uppercase;
}

.dispatch-form select,
.dispatch-form textarea {
  width: 100%;
  box-sizing: border-box;
  margin-top: 5px;
  padding: 9px 10px;
  border: 1px solid #ccd9d1;
  border-radius: 6px;
  background: #fbfcfb;
  color: #26342d;
  font: inherit;
  font-size: 12px;
  outline: none;
}

.dispatch-form textarea {
  resize: none;
}

.dispatch-form select:focus,
.dispatch-form textarea:focus {
  border-color: #0a8f55;
  box-shadow: 0 0 0 2px rgba(10, 143, 85, .08);
}

.send-btn {
  border: 0;
  border-radius: 6px;
  padding: 10px 14px;
  background: #087443;
  color: #fff;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.send-btn:hover {
  background: #065c36;
}

.send-btn span {
  margin-left: 7px;
}

/* HISTORY */
.history {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #e5ebe7;
}

.history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
}

.history-head h3 {
  margin: 0;
  font-size: 12px;
}

.history-head small {
  color: #8a9690;
  font-size: 10px;
}

.history-head b {
  padding: 4px 7px;
  border-radius: 4px;
  background: #f0f5f2;
  color: #087443;
  font-size: 10px;
}

.message-list {
  max-height: 180px;
  overflow-y: auto;
}

.message {
  padding: 9px 10px;
  margin-bottom: 6px;
  border: 1px solid #e1e9e4;
  border-radius: 6px;
  background: #fafcfb;
}

.message strong {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #46554d;
  font-size: 10px;
}

.message p {
  margin: 5px 0 0;
  color: #6c7972;
  font-size: 11px;
  line-height: 1.45;
}

/* USERS */
.users {
  max-height: 350px;
  overflow-y: auto;
}

.user {
  display: grid;
  grid-template-columns: 30px minmax(130px, 1fr) auto auto auto;
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
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #eaf4ee;
  color: #087443;
  font-size: 11px;
  font-weight: 800;
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
  color: #29372f;
  font-size: 11px;
}

.user-info small {
  margin-top: 2px;
  color: #8a9690;
  font-size: 9px;
}

.role,
.status {
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
}

.role {
  background: #f1f4f2;
  color: #65726b;
}

.status.active {
  background: #e9f7ef;
  color: #087443;
}

.status.inactive {
  background: #fff3df;
  color: #b66a08;
}

.actions {
  display: flex;
  gap: 4px;
}

.actions button {
  padding: 5px 7px;
  border: 1px solid #cfe0d6;
  border-radius: 4px;
  background: #f5faf7;
  color: #087443;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.actions button:hover {
  background: #e7f3ec;
}

.actions .delete {
  border-color: #edcccc;
  background: #fff7f7;
  color: #b42318;
}

.empty {
  padding: 20px;
  text-align: center;
  color: #89958f;
  font-size: 11px;
  border: 1px dashed #d8e2dc;
  border-radius: 6px;
}

/* RESPONSIVE */
@media (max-width: 1050px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .map {
    height: 280px;
  }

  .user {
    grid-template-columns: 30px 1fr auto;
  }

  .user .role,
  .user .status {
    display: none;
  }

  .actions {
    grid-column: 2 / -1;
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
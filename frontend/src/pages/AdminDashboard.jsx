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

        <header className="dash-head">
          <div>
            <span className="kicker">RELIFENOTIFY / OPERATIONS</span>
            <h1>Good evening, Admin.</h1>
            <p>Here is the current emergency response overview.</p>
          </div>

          <div className="live">
            <span />
            LIVE SYSTEM
          </div>
        </header>

        <section className="overview">
          <div className="overview-title">
            <span className="kicker">FIELD OVERVIEW</span>
            <h2>Incident activity</h2>
          </div>

          <div className="stats">
            <Stat label="Reports" value={total} />
            <Stat label="Ongoing" value={ongoing} type="amber" />
            <Stat label="Resolved" value={resolved} type="teal" />
            <Stat label="Barangays" value={barangays} type="blue" />
          </div>
        </section>

        <section className="map-section">
          <div className="map-head">
            <div>
              <span className="kicker">LIVE MAP</span>
              <h2>Incident activity zone</h2>
            </div>

            <span className="map-note">
              <i /> {ongoing} active response
            </span>
          </div>

          <div className="map">
            {loading ? (
              <div className="loading">Loading incident data...</div>
            ) : (
              <IncidentMap incidents={incidents} />
            )}
          </div>
        </section>

        <div className="bottom-grid">

          <section className="dispatch">
            <span className="kicker">COMMUNICATIONS</span>
            <h2>Dispatch staff</h2>
            <p className="muted">Send instructions to field personnel.</p>

            <form onSubmit={handleSendMessage}>
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
                <option value="">Choose staff member</option>
                {responders.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.role || "user"})
                  </option>
                ))}
              </select>

              <textarea
                rows="3"
                placeholder="Operational instructions..."
                value={messageForm.message}
                onChange={(e) =>
                  setMessageForm({
                    ...messageForm,
                    message: e.target.value,
                  })
                }
                required
              />

              <button type="submit">
                Send dispatch <span>↗</span>
              </button>
            </form>

            <div className="messages">
              <div className="subhead">
                <strong>Recent dispatches</strong>
                <span>{messages.length}</span>
              </div>

              {messages.length === 0 ? (
                <div className="empty">No dispatches yet.</div>
              ) : (
                messages.map((msg) => (
                  <div className="message" key={msg.message_id}>
                    <small>TO {msg.receiver_name}</small>
                    <p>{msg.message}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="accounts">
            <div className="account-head">
              <div>
                <span className="kicker">ACCESS CONTROL</span>
                <h2>Operational accounts</h2>
              </div>
              <strong>{users.length}</strong>
            </div>

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

                      <span className={`status ${active ? "active" : ""}`}>
                        {user.status || "Unknown"}
                      </span>

                      <div className="actions">
                        <button
                          onClick={() => updateStatus(user.id, "Active")}
                        >
                          Activate
                        </button>

                        <button
                          onClick={() => updateStatus(user.id, "Inactive")}
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

function Stat({ label, value, type = "" }) {
  return (
    <div className={`stat ${type}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.admin-dashboard {
  min-height: 100%;
  padding: 30px clamp(20px, 4vw, 52px) 45px;
  background:
    radial-gradient(circle at 85% 5%, #dcefe7 0, transparent 28%),
    #f5f7f4;
  color: #17241f;
}

/* HEADER */

.dash-head,
.map-head,
.account-head,
.subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kicker {
  color: #08744a;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.6px;
}

.dash-head h1 {
  margin: 7px 0 3px;
  font-size: 29px;
  letter-spacing: -1px;
}

.dash-head p,
.muted {
  margin: 0;
  color: #78847e;
  font-size: 11px;
}

.live {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border-radius: 20px;
  background: #e2f3e9;
  color: #08744a;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: .8px;
}

.live span,
.map-note i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0b9a60;
}

/* OVERVIEW */

.overview {
  display: grid;
  grid-template-columns: 190px 1fr;
  gap: 20px;
  align-items: end;
  margin: 35px 0 18px;
}

.overview h2,
.map-head h2,
.dispatch h2,
.accounts h2 {
  margin: 5px 0 0;
  font-size: 17px;
  letter-spacing: -.3px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat {
  position: relative;
  min-height: 74px;
  padding: 13px 15px;
  border-radius: 12px;
  background: #e9efeb;
  overflow: hidden;
}

.stat::after {
  content: "";
  position: absolute;
  right: -18px;
  bottom: -24px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #d9e8df;
}

.stat span {
  color: #68766f;
  font-size: 9px;
  font-weight: 750;
}

.stat strong {
  display: block;
  margin-top: 7px;
  font-size: 25px;
  line-height: 1;
}

.stat.amber {
  background: #f8ead5;
}

.stat.amber::after {
  background: #f1d5ae;
}

.stat.amber strong {
  color: #c16b0b;
}

.stat.teal {
  background: #dcefeb;
}

.stat.teal::after {
  background: #c7e4dc;
}

.stat.teal strong {
  color: #087c70;
}

.stat.blue {
  background: #e5e8f5;
}

.stat.blue::after {
  background: #d4d9ec;
}

.stat.blue strong {
  color: #5665a5;
}

/* MAP */

.map-section {
  padding: 20px 0 0;
}

.map-head {
  margin-bottom: 12px;
}

.map-note {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #68756e;
  font-size: 9px;
  font-weight: 700;
}

.map {
  height: 335px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #d7e1da;
  background: #e8eee9;
  box-shadow: 0 12px 30px rgba(31, 67, 49, .07);
}

.loading {
  height: 100%;
  display: grid;
  place-items: center;
  color: #718078;
  font-size: 11px;
}

/* LOWER */

.bottom-grid {
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 35px;
  margin-top: 28px;
}

.dispatch {
  padding: 4px 0;
}

.dispatch form {
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.dispatch select,
.dispatch textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d4ded8;
  border-radius: 9px;
  background: #fff;
  padding: 10px;
  color: #24332b;
  font: inherit;
  font-size: 10px;
  outline: none;
}

.dispatch textarea {
  resize: none;
}

.dispatch select:focus,
.dispatch textarea:focus {
  border-color: #168c68;
  box-shadow: 0 0 0 3px #dcefe7;
}

.dispatch form button {
  border: 0;
  border-radius: 9px;
  padding: 10px 13px;
  background: #173f32;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  text-align: left;
}

.dispatch form button span {
  float: right;
  font-size: 13px;
}

.messages {
  margin-top: 20px;
}

.subhead {
  padding-bottom: 8px;
  border-bottom: 1px solid #dfe6e1;
  font-size: 10px;
}

.subhead span,
.account-head > strong {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  border-radius: 7px;
  background: #e2f1eb;
  color: #08744a;
  font-size: 9px;
}

.message {
  padding: 9px 0;
  border-bottom: 1px solid #e4e9e5;
}

.message small {
  color: #0b8b61;
  font-size: 7px;
  font-weight: 900;
}

.message p {
  margin: 3px 0 0;
  color: #68766e;
  font-size: 10px;
}

/* ACCOUNTS */

.accounts {
  min-width: 0;
}

.account-head {
  margin-bottom: 12px;
}

.users {
  max-height: 255px;
  overflow-y: auto;
  padding-right: 5px;
}

.user {
  display: grid;
  grid-template-columns: 32px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #dfe6e1;
}

.avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #dce9e3;
  color: #08744a;
  font-size: 11px;
  font-weight: 900;
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
  font-size: 10px;
}

.user-info small {
  margin-top: 2px;
  color: #89938e;
  font-size: 8px;
}

.status {
  padding: 4px 7px;
  border-radius: 20px;
  background: #f8e6d9;
  color: #b85d2b;
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
}

.status.active {
  background: #dff2e8;
  color: #08744a;
}

.actions {
  display: flex;
  gap: 4px;
}

.actions button {
  border: 1px solid #d3dfd8;
  border-radius: 6px;
  padding: 5px 7px;
  background: transparent;
  color: #356453;
  font-size: 7px;
  font-weight: 800;
  cursor: pointer;
}

.actions button:hover {
  background: #e4f0ea;
}

.actions .delete {
  border-color: #eccfca;
  color: #bd493d;
}

.empty {
  padding: 15px 0;
  color: #89958f;
  font-size: 10px;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .overview {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .dash-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .map {
    height: 260px;
  }

  .user {
    grid-template-columns: 32px 1fr auto;
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
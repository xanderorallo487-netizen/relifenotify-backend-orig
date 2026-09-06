import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// COMPONENTS
import AdminLayout from "../components/AdminLayout";
import IncidentMap from "../components/IncidentMap";

function AdminDashboard() {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({
    receiver_id: "",
    message: ""
  });
  const [btnHover, setBtnHover] = useState(false);

  // =====================================
  // FETCH DATA
  // =====================================
  useEffect(() => {
    fetchIncidents();
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await api.get("/incidents");

      if (response.data.success) {
        setIncidents(response.data.incidents);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get("/admin-messages");
      setMessages(response.data);
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
        message: messageForm.message
      });

      setMessageForm({
        receiver_id: "",
        message: ""
      });

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // =====================================
  // COUNTS & FILTERED RECIPIENTS
  // =====================================
  const totalIncidents = incidents.length;

  const ongoingIncidents = incidents.filter(
    (i) => i.status?.toLowerCase() === "ongoing"
  ).length;

  const resolvedIncidents = incidents.filter(
    (i) => i.status?.toLowerCase() === "resolved"
  ).length;

  const affectedBarangays = [
    ...new Set(incidents.map((i) => i.barangay))
  ].length;

  const potentialResponders = users.filter((u) => {
    const role = u.role?.toLowerCase();

    return (
      role === "staff" ||
      role === "responder" ||
      role === "user" ||
      role !== "admin"
    );
  });

  return (
    <AdminLayout
      title="ReLifeNotify Admin Dashboard"
      subtitle="Real-Time Incident Monitoring & Team Coordination"
    >
      <div className="dashboard">

        {/* =====================================
            HEADER
        ===================================== */}
        <header className="dashboard-header">
          <div>
            <div className="brand-line">
              <span className="brand-mark" />
              RELIFENOTIFY
            </div>

            <h1>Operations Dashboard</h1>

            <p>
              Real-time emergency monitoring and response coordination.
            </p>
          </div>

          <div className="header-actions">
            <div className="system-status">
              <span />
              SYSTEM ONLINE
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* =====================================
            STATISTICS
        ===================================== */}
        <section className="stats-section">

          <div className="section-intro">
            <span>OVERVIEW</span>
            <h2>Current situation</h2>
          </div>

          <div className="stats">

            <div className="stat stat-dark">
              <div>
                <small>TOTAL INCIDENTS</small>
                <strong>{totalIncidents}</strong>
              </div>

              <div className="stat-icon">01</div>
            </div>

            <div className="stat stat-yellow">
              <div>
                <small>ONGOING</small>
                <strong>{ongoingIncidents}</strong>
              </div>

              <div className="stat-icon">02</div>
            </div>

            <div className="stat stat-light">
              <div>
                <small>RESOLVED</small>
                <strong>{resolvedIncidents}</strong>
              </div>

              <div className="stat-icon">03</div>
            </div>

            <div className="stat stat-outline">
              <div>
                <small>BARANGAYS AFFECTED</small>
                <strong>{affectedBarangays}</strong>
              </div>

              <div className="stat-icon">04</div>
            </div>

          </div>
        </section>

        {/* =====================================
            MAP
        ===================================== */}
        <section className="map-section">

          <div className="map-header">

            <div>
              <span className="section-tag">LIVE MONITORING</span>

              <h2>Incident activity map</h2>

              <p>
                Geographic overview of reported emergency incidents.
              </p>
            </div>

            <div className="incident-indicator">
              <span />
              {ongoingIncidents} ACTIVE INCIDENT
              {ongoingIncidents !== 1 ? "S" : ""}
            </div>

          </div>

          <div className="map-container">
            {loading ? (
              <div className="loading">
                <span className="loading-dot" />
                Loading incident data...
              </div>
            ) : (
              <IncidentMap incidents={incidents} />
            )}
          </div>

        </section>

        {/* =====================================
            LOWER GRID
        ===================================== */}
        <div className="workspace">

          {/* =====================================
              DISPATCH
          ===================================== */}
          <section className="dispatch-section">

            <div className="section-tag">
              COMMUNICATIONS
            </div>

            <h2>Dispatch staff</h2>

            <p className="description">
              Send instructions and operational updates to field personnel.
            </p>

            <form
              onSubmit={handleSendMessage}
              className="dispatch-form"
            >

              <div className="field">

                <label>RECIPIENT</label>

                <select
                  value={messageForm.receiver_id}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      receiver_id: e.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Choose a responder...
                  </option>

                  {potentialResponders.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role || "user"})
                    </option>
                  ))}
                </select>

              </div>

              <div className="field">

                <label>MESSAGE</label>

                <textarea
                  placeholder="Type dispatch instructions..."
                  rows="4"
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      message: e.target.value
                    })
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className={`dispatch-button ${
                  btnHover ? "hover" : ""
                }`}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
              >
                SEND OFFICIAL DISPATCH
                <span>↗</span>
              </button>

            </form>

            {/* DISPATCH HISTORY */}
            <div className="dispatch-history">

              <div className="history-header">
                <div>
                  <span>COMMUNICATION LOG</span>
                  <h3>Recent dispatches</h3>
                </div>

                <strong>{messages.length}</strong>
              </div>

              <div className="message-list">

                {messages.length === 0 ? (
                  <div className="empty">
                    No dispatches yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      className="message"
                    >
                      <div className="message-top">
                        <span className="message-dot" />
                        <span>
                          TO: {msg.receiver_name}
                        </span>
                      </div>

                      <p>{msg.message}</p>
                    </div>
                  ))
                )}

              </div>

            </div>

          </section>

          {/* =====================================
              ACCOUNTS
          ===================================== */}
          <section className="accounts-section">

            <div className="accounts-header">

              <div>
                <span className="section-tag">
                  ACCESS CONTROL
                </span>

                <h2>Operational accounts</h2>

                <p className="description">
                  Manage personnel access and system status.
                </p>
              </div>

              <div className="account-count">
                {users.length}
              </div>

            </div>

            <div className="users-list">

              {users.length === 0 ? (
                <div className="empty">
                  No user accounts found.
                </div>
              ) : (
                users.map((user) => {

                  const active =
                    user.status?.toLowerCase() === "active";

                  return (
                    <div
                      className="user-row"
                      key={user.id}
                    >

                      <div className="avatar">
                        {user.full_name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div className="user-details">

                        <strong>
                          {user.full_name}
                        </strong>

                        <small>
                          {user.email}
                        </small>

                      </div>

                      <span className="role">
                        {user.role || "USER"}
                      </span>

                      <span
                        className={`user-status ${
                          active ? "active" : "inactive"
                        }`}
                      >
                        <i />
                        {user.status || "Unknown"}
                      </span>

                      <div className="user-actions">

                        <button
                          onClick={() =>
                            updateStatus(
                              user.id,
                              "Active"
                            )
                          }
                        >
                          Activate
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              user.id,
                              "Inactive"
                            )
                          }
                        >
                          Deactivate
                        </button>

                        {user.role !== "admin" && (
                          <button
                            className="delete"
                            onClick={() =>
                              deleteUser(user.id)
                            }
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

      </div>

      <style>{styles}</style>
    </AdminLayout>
  );
}

// =====================================
// STYLES
// =====================================

const styles = `

/* ===============================
   BASE
================================ */

.dashboard {
  min-height: 100vh;
  padding: 34px clamp(20px, 4vw, 55px) 50px;
  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(245, 197, 24, 0.13),
      transparent 28%
    ),
    #f4f3ee;
  color: #111111;
  box-sizing: border-box;
}


/* ===============================
   HEADER
================================ */

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 38px;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111111;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.brand-mark {
  width: 9px;
  height: 9px;
  background: #f5c518;
  display: inline-block;
  transform: rotate(45deg);
}

.dashboard-header h1 {
  margin: 10px 0 5px;
  font-size: clamp(27px, 3vw, 38px);
  line-height: 1;
  letter-spacing: -1.5px;
}

.dashboard-header p {
  margin: 0;
  color: #73736e;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  background: #111111;
  color: #ffffff;
  border-radius: 30px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: .7px;
}

.system-status span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5c518;
}

.logout-button {
  border: 1px solid #111111;
  background: transparent;
  color: #111111;
  padding: 9px 13px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.logout-button:hover {
  background: #111111;
  color: #ffffff;
}


/* ===============================
   OVERVIEW
================================ */

.stats-section {
  margin-bottom: 35px;
}

.section-intro {
  margin-bottom: 13px;
}

.section-intro span,
.section-tag,
.history-header > div > span {
  color: #77756c;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1.6px;
}

.section-intro h2 {
  margin: 5px 0 0;
  font-size: 17px;
  letter-spacing: -.4px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat {
  min-height: 100px;
  padding: 17px;
  border-radius: 13px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
}

.stat small {
  display: block;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
}

.stat strong {
  display: block;
  margin-top: 12px;
  font-size: 31px;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 900;
}

.stat-dark {
  background: #111111;
  color: #ffffff;
}

.stat-dark small {
  color: #aaaaaa;
}

.stat-dark strong {
  color: #f5c518;
}

.stat-dark .stat-icon {
  background: #2b2b2b;
  color: #f5c518;
}

.stat-yellow {
  background: #f5c518;
  color: #111111;
}

.stat-yellow .stat-icon {
  background: rgba(0,0,0,.12);
}

.stat-light {
  background: #ffffff;
  border: 1px solid #deddd6;
}

.stat-light small {
  color: #777777;
}

.stat-light strong {
  color: #111111;
}

.stat-light .stat-icon {
  background: #eeeeea;
  color: #555555;
}

.stat-outline {
  background: transparent;
  border: 1px solid #cfcfc7;
}

.stat-outline small {
  color: #777777;
}

.stat-outline strong {
  color: #111111;
}

.stat-outline .stat-icon {
  background: #111111;
  color: #f5c518;
}


/* ===============================
   MAP
================================ */

.map-section {
  margin-bottom: 38px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 13px;
}

.map-header h2 {
  margin: 5px 0 3px;
  font-size: 20px;
  letter-spacing: -.6px;
}

.map-header p {
  margin: 0;
  color: #777871;
  font-size: 11px;
}

.incident-indicator {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  background: #fff2b8;
  color: #6f5700;
  border-radius: 20px;
  font-size: 8px;
  font-weight: 900;
}

.incident-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5c518;
}

.map-container {
  height: 335px;
  overflow: hidden;
  border-radius: 15px;
  border: 1px solid #d6d5ce;
  background: #e9e8e1;
  box-shadow: 0 12px 30px rgba(0,0,0,.06);
}

.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #777871;
  font-size: 11px;
}

.loading-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f5c518;
}


/* ===============================
   WORKSPACE
================================ */

.workspace {
  display: grid;
  grid-template-columns: .82fr 1.18fr;
  gap: 45px;
}


/* ===============================
   DISPATCH
================================ */

.dispatch-section h2,
.accounts-section h2 {
  margin: 6px 0 4px;
  font-size: 20px;
  letter-spacing: -.6px;
}

.description {
  margin: 0;
  color: #777871;
  font-size: 11px;
  line-height: 1.5;
}

.dispatch-form {
  display: grid;
  gap: 11px;
  margin-top: 18px;
}

.field label {
  display: block;
  margin-bottom: 5px;
  color: #555650;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
}

.field select,
.field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d1d0c8;
  background: #ffffff;
  color: #111111;
  border-radius: 8px;
  padding: 10px 11px;
  outline: none;
  font: inherit;
  font-size: 11px;
}

.field select:focus,
.field textarea:focus {
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(245,197,24,.28);
}

.field textarea {
  resize: none;
}

.dispatch-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 0;
  border-radius: 8px;
  padding: 12px 14px;
  background: #111111;
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .7px;
  cursor: pointer;
  transition: .2s ease;
}

.dispatch-button span {
  color: #f5c518;
  font-size: 15px;
}

.dispatch-button.hover {
  background: #f5c518;
  color: #111111;
}

.dispatch-button.hover span {
  color: #111111;
}


/* ===============================
   HISTORY
================================ */

.dispatch-history {
  margin-top: 27px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #d8d7d0;
}

.history-header h3 {
  margin: 4px 0 0;
  font-size: 12px;
}

.history-header strong,
.account-count {
  display: grid;
  place-items: center;
  min-width: 25px;
  height: 25px;
  padding: 0 5px;
  box-sizing: border-box;
  border-radius: 7px;
  background: #111111;
  color: #f5c518;
  font-size: 9px;
}

.message-list {
  max-height: 210px;
  overflow-y: auto;
}

.message {
  padding: 10px 0;
  border-bottom: 1px solid #dfded7;
}

.message-top {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #555650;
  font-size: 8px;
  font-weight: 900;
}

.message-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f5c518;
}

.message p {
  margin: 5px 0 0;
  color: #6f706b;
  font-size: 10px;
  line-height: 1.45;
}


/* ===============================
   ACCOUNTS
================================ */

.accounts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 17px;
}

.users-list {
  max-height: 355px;
  overflow-y: auto;
  padding-right: 4px;
}

.user-row {
  display: grid;
  grid-template-columns: 34px 1fr auto auto auto;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #deddd6;
}

.avatar {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #111111;
  color: #f5c518;
  font-size: 11px;
  font-weight: 900;
}

.user-details {
  min-width: 0;
}

.user-details strong,
.user-details small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details strong {
  font-size: 10px;
}

.user-details small {
  margin-top: 2px;
  color: #85857f;
  font-size: 8px;
}

.role {
  padding: 4px 7px;
  border-radius: 5px;
  background: #e7e6df;
  color: #555650;
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 7px;
  border-radius: 20px;
  font-size: 7px;
  font-weight: 900;
  text-transform: uppercase;
}

.user-status i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.user-status.active {
  background: #e7f3dc;
  color: #52731e;
}

.user-status.active i {
  background: #78a82e;
}

.user-status.inactive {
  background: #fff0bd;
  color: #816300;
}

.user-status.inactive i {
  background: #f5c518;
}

.user-actions {
  display: flex;
  gap: 4px;
}

.user-actions button {
  border: 1px solid #d2d1c9;
  background: transparent;
  color: #33342f;
  padding: 5px 7px;
  border-radius: 5px;
  font-size: 7px;
  font-weight: 800;
  cursor: pointer;
}

.user-actions button:hover {
  background: #111111;
  color: #f5c518;
  border-color: #111111;
}

.user-actions .delete {
  color: #b63b3b;
  border-color: #e1c1c1;
}

.user-actions .delete:hover {
  background: #b63b3b;
  color: #ffffff;
  border-color: #b63b3b;
}


/* ===============================
   EMPTY
================================ */

.empty {
  padding: 18px 0;
  color: #888881;
  font-size: 10px;
}


/* ===============================
   SCROLLBARS
================================ */

.message-list::-webkit-scrollbar,
.users-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-thumb,
.users-list::-webkit-scrollbar-thumb {
  background: #c7c6bf;
  border-radius: 10px;
}


/* ===============================
   RESPONSIVE
================================ */

@media (max-width: 1050px) {

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .workspace {
    grid-template-columns: 1fr;
    gap: 35px;
  }

}

@media (max-width: 700px) {

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .map-container {
    height: 280px;
  }

  .map-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .user-row {
    grid-template-columns: 34px 1fr auto;
  }

  .role,
  .user-status {
    display: none;
  }

  .user-actions {
    grid-column: 2 / -1;
  }

}

@media (max-width: 480px) {

  .dashboard {
    padding: 25px 15px 40px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .stat {
    min-height: 85px;
  }

}

`;

export default AdminDashboard;
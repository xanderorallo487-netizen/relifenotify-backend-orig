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
    message: "",
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

  // =====================================
  // MESSAGE HANDLING
  // =====================================
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

      setMessageForm({
        receiver_id: "",
        message: "",
      });

      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // =====================================
  // USER MANAGEMENT
  // =====================================
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

  // =====================================
  // LOGOUT
  // =====================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // =====================================
  // DASHBOARD COUNTS
  // =====================================
  const totalIncidents = incidents.length;

  const ongoingIncidents = incidents.filter(
    (incident) => incident.status?.toLowerCase() === "ongoing"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status?.toLowerCase() === "resolved"
  ).length;

  const affectedBarangays = [
    ...new Set(
      incidents
        .map((incident) => incident.barangay)
        .filter(Boolean)
    ),
  ].length;

  // =====================================
  // MESSAGE RECIPIENTS
  // =====================================
  const potentialResponders = users.filter((user) => {
    const role = user.role?.toLowerCase();

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
      <div style={pageStyle}>

        {/* =====================================
            PAGE INTRO
        ===================================== */}
        <div style={introStyle}>
          <div>
            <div style={eyebrowStyle}>OPERATIONS OVERVIEW</div>

            <h1 style={pageTitleStyle}>
              Incident Command Center
            </h1>

            <p style={pageDescriptionStyle}>
              Monitor active incidents, coordinate personnel, and manage
              operational accounts from one workspace.
            </p>
          </div>

          <div style={statusIndicatorStyle}>
            <span style={statusDotStyle}></span>
            <span>System Operational</span>
          </div>
        </div>

        {/* =====================================
            SUMMARY STATISTICS
        ===================================== */}
        <div style={statsGridStyle}>

          <StatCard
            label="Total Incidents"
            value={totalIncidents}
            detail="All recorded incidents"
            accent="#1e293b"
          />

          <StatCard
            label="Ongoing"
            value={ongoingIncidents}
            detail="Currently requiring attention"
            accent="#b45309"
          />

          <StatCard
            label="Resolved"
            value={resolvedIncidents}
            detail="Successfully closed"
            accent="#047857"
          />

          <StatCard
            label="Barangays Affected"
            value={affectedBarangays}
            detail="Locations with incidents"
            accent="#2563eb"
          />

        </div>

        {/* =====================================
            INCIDENT MAP
        ===================================== */}
        <section style={sectionStyle}>

          <div style={sectionHeaderContainerStyle}>
            <div>
              <div style={sectionEyebrowStyle}>
                LIVE MONITORING
              </div>

              <h2 style={sectionTitleStyle}>
                Incident Map
              </h2>

              <p style={sectionDescriptionStyle}>
                Geographic overview of reported incidents and affected areas.
              </p>
            </div>

            <div style={mapLegendStyle}>
              <span style={legendItemStyle}>
                <span
                  style={{
                    ...legendDotStyle,
                    background: "#dc2626",
                  }}
                />
                Incident
              </span>

              <span style={legendItemStyle}>
                <span
                  style={{
                    ...legendDotStyle,
                    background: "#2563eb",
                  }}
                />
                Location
              </span>
            </div>
          </div>

          <div style={mapContainerStyle}>
            {loading ? (
              <div style={mapLoadingStyle}>
                <div style={loadingDotStyle}></div>
                Loading incident data...
              </div>
            ) : (
              <IncidentMap incidents={incidents} />
            )}
          </div>

        </section>

        {/* =====================================
            LOWER CONTENT
        ===================================== */}
        <div style={contentGridStyle}>

          {/* =====================================
              DISPATCH CENTER
          ===================================== */}
          <section style={sectionStyle}>

            <div style={sectionHeaderContainerStyle}>
              <div>
                <div style={sectionEyebrowStyle}>
                  COMMUNICATIONS
                </div>

                <h2 style={sectionTitleStyle}>
                  Staff Dispatch
                </h2>

                <p style={sectionDescriptionStyle}>
                  Send operational instructions directly to staff and
                  responders.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSendMessage}
              style={formStyle}
            >

              <div>
                <label style={labelStyle}>
                  Recipient
                </label>

                <select
                  value={messageForm.receiver_id}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      receiver_id: e.target.value,
                    })
                  }
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Select staff member
                  </option>

                  {potentialResponders.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.full_name} ({user.role || "user"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Message
                </label>

                <textarea
                  placeholder="Enter an operational update or task instruction..."
                  rows="4"
                  value={messageForm.message}
                  onChange={(e) =>
                    setMessageForm({
                      ...messageForm,
                      message: e.target.value,
                    })
                  }
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "100px",
                  }}
                />
              </div>

              <button
                type="submit"
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{
                  ...primaryButtonStyle,
                  background: btnHover ? "#065f46" : "#047857",
                }}
              >
                Send Dispatch
                <span style={buttonArrowStyle}>→</span>
              </button>

            </form>

            {/* DISPATCH HISTORY */}
            <div style={historyContainerStyle}>

              <div style={historyHeaderStyle}>
                <div>
                  <h3 style={historyTitleStyle}>
                    Recent Dispatches
                  </h3>

                  <span style={historySubtitleStyle}>
                    Latest messages sent by administrators
                  </span>
                </div>

                <span style={countBadgeStyle}>
                  {messages.length}
                </span>
              </div>

              <div style={messageListStyle}>

                {messages.length === 0 ? (
                  <div style={emptyStateStyle}>
                    No dispatches have been sent yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.message_id}
                      style={messageItemStyle}
                    >
                      <div style={messageTopStyle}>

                        <div style={recipientStyle}>
                          <span style={recipientIndicatorStyle}></span>
                          To {msg.receiver_name}
                        </div>

                      </div>

                      <p style={messageTextStyle}>
                        {msg.message}
                      </p>
                    </div>
                  ))
                )}

              </div>
            </div>

          </section>

          {/* =====================================
              ACCOUNT MANAGEMENT
          ===================================== */}
          <section style={sectionStyle}>

            <div style={sectionHeaderContainerStyle}>
              <div>
                <div style={sectionEyebrowStyle}>
                  ACCESS CONTROL
                </div>

                <h2 style={sectionTitleStyle}>
                  User Accounts
                </h2>

                <p style={sectionDescriptionStyle}>
                  Review account status and manage operational access.
                </p>
              </div>

              <span style={countBadgeStyle}>
                {users.length}
              </span>
            </div>

            <div style={userListStyle}>

              {users.length === 0 ? (
                <div style={emptyStateStyle}>
                  No user accounts found.
                </div>
              ) : (
                users.map((user) => {

                  const isActive =
                    user.status?.toLowerCase() === "active";

                  return (
                    <div
                      key={user.id}
                      style={userItemStyle}
                    >

                      <div style={userInfoStyle}>

                        <div style={avatarStyle}>
                          {user.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <h4 style={userNameStyle}>
                            {user.full_name}
                          </h4>

                          <p style={userEmailStyle}>
                            {user.email}
                          </p>
                        </div>

                      </div>

                      <div style={userMetaStyle}>

                        <span style={roleBadgeStyle}>
                          {user.role || "USER"}
                        </span>

                        <span
                          style={{
                            ...accountStatusStyle,
                            color: isActive
                              ? "#047857"
                              : "#b45309",
                            background: isActive
                              ? "#ecfdf5"
                              : "#fffbeb",
                            borderColor: isActive
                              ? "#a7f3d0"
                              : "#fde68a",
                          }}
                        >
                          <span
                            style={{
                              ...smallStatusDotStyle,
                              background: isActive
                                ? "#059669"
                                : "#d97706",
                            }}
                          />

                          {user.status || "Unknown"}
                        </span>

                      </div>

                      <div style={userActionsStyle}>

                        <button
                          onClick={() =>
                            updateStatus(user.id, "Active")
                          }
                          style={activateButtonStyle}
                        >
                          Activate
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(user.id, "Inactive")
                          }
                          style={deactivateButtonStyle}
                        >
                          Deactivate
                        </button>

                        {user.role !== "admin" && (
                          <button
                            onClick={() =>
                              deleteUser(user.id)
                            }
                            style={deleteButtonStyle}
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
    </AdminLayout>
  );
}

// =====================================
// STAT CARD COMPONENT
// =====================================
function StatCard({
  label,
  value,
  detail,
  accent,
}) {
  return (
    <div style={statCardStyle}>

      <div
        style={{
          ...statAccentStyle,
          background: accent,
        }}
      />

      <div style={statContentStyle}>

        <div style={statTopRowStyle}>
          <span style={statLabelStyle}>
            {label}
          </span>

          <span
            style={{
              ...statIndicatorStyle,
              background: `${accent}18`,
              color: accent,
            }}
          >
            •
          </span>
        </div>

        <div style={statValueStyle}>
          {value}
        </div>

        <div style={statDetailStyle}>
          {detail}
        </div>

      </div>

    </div>
  );
}

// =====================================
// PAGE
// =====================================
const pageStyle = {
  padding: "34px clamp(20px, 4vw, 56px) 60px",
  background: "#f6f8f7",
  minHeight: "100%",
};

// =====================================
// INTRO
// =====================================
const introStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "24px",
  marginBottom: "28px",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1.4px",
  color: "#047857",
  marginBottom: "7px",
};

const pageTitleStyle = {
  margin: 0,
  color: "#17211d",
  fontSize: "28px",
  lineHeight: 1.2,
  fontWeight: "750",
  letterSpacing: "-0.7px",
};

const pageDescriptionStyle = {
  margin: "8px 0 0",
  color: "#66736d",
  fontSize: "14px",
  lineHeight: 1.6,
  maxWidth: "620px",
};

const statusIndicatorStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  background: "#ffffff",
  border: "1px solid #dce5df",
  borderRadius: "7px",
  color: "#466057",
  fontSize: "12px",
  fontWeight: "650",
};

const statusDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#059669",
};

// =====================================
// STATISTICS
// =====================================
const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
  marginBottom: "22px",
};

const statCardStyle = {
  position: "relative",
  display: "flex",
  minHeight: "125px",
  background: "#ffffff",
  border: "1px solid #dfe7e2",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
};

const statAccentStyle = {
  width: "3px",
  flexShrink: 0,
};

const statContentStyle = {
  padding: "18px 19px",
  width: "100%",
};

const statTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statLabelStyle = {
  fontSize: "12px",
  color: "#66736d",
  fontWeight: "700",
};

const statIndicatorStyle = {
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  fontSize: "17px",
  lineHeight: 1,
};

const statValueStyle = {
  marginTop: "9px",
  fontSize: "30px",
  lineHeight: 1,
  color: "#17211d",
  fontWeight: "750",
  letterSpacing: "-1px",
};

const statDetailStyle = {
  marginTop: "9px",
  color: "#8a9690",
  fontSize: "11px",
};

// =====================================
// SECTIONS
// =====================================
const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #dfe7e2",
  borderRadius: "10px",
  padding: "24px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.02)",
  marginBottom: "22px",
};

const sectionHeaderContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "20px",
};

const sectionEyebrowStyle = {
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "1.2px",
  color: "#87938d",
  marginBottom: "5px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#17211d",
  fontSize: "19px",
  fontWeight: "750",
  letterSpacing: "-0.3px",
};

const sectionDescriptionStyle = {
  margin: "5px 0 0",
  color: "#77837d",
  fontSize: "12.5px",
  lineHeight: 1.5,
};

// =====================================
// MAP
// =====================================
const mapLegendStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  paddingTop: "3px",
};

const legendItemStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "11px",
  color: "#66736d",
  fontWeight: "600",
};

const legendDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
};

const mapContainerStyle = {
  height: "430px",
  border: "1px solid #dfe7e2",
  borderRadius: "8px",
  overflow: "hidden",
  background: "#f4f7f5",
};

const mapLoadingStyle = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  color: "#7b8781",
  fontSize: "13px",
};

const loadingDotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#059669",
};

// =====================================
// LOWER GRID
// =====================================
const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)",
  gap: "22px",
  alignItems: "start",
};

// =====================================
// FORM
// =====================================
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#46534d",
  fontSize: "11px",
  fontWeight: "750",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #ccd8d1",
  borderRadius: "7px",
  background: "#fbfcfb",
  color: "#26332d",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
};

const primaryButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: "100%",
  border: "none",
  borderRadius: "7px",
  padding: "11px 16px",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const buttonArrowStyle = {
  fontSize: "16px",
};

// =====================================
// MESSAGE HISTORY
// =====================================
const historyContainerStyle = {
  marginTop: "25px",
  paddingTop: "20px",
  borderTop: "1px solid #e5ebe7",
};

const historyHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
};

const historyTitleStyle = {
  margin: 0,
  color: "#25322c",
  fontSize: "13px",
  fontWeight: "750",
};

const historySubtitleStyle = {
  display: "block",
  marginTop: "3px",
  color: "#8a9690",
  fontSize: "11px",
};

const countBadgeStyle = {
  minWidth: "23px",
  height: "23px",
  padding: "0 6px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  borderRadius: "5px",
  background: "#f0f4f1",
  border: "1px solid #dce5df",
  color: "#52615a",
  fontSize: "11px",
  fontWeight: "750",
};

const messageListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "265px",
  overflowY: "auto",
  paddingRight: "3px",
};

const messageItemStyle = {
  padding: "12px 13px",
  background: "#fafcfb",
  border: "1px solid #e2e9e5",
  borderRadius: "7px",
};

const messageTopStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "7px",
};

const recipientStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  color: "#46534d",
  fontSize: "11px",
  fontWeight: "750",
};

const recipientIndicatorStyle = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: "#059669",
};

const messageTextStyle = {
  margin: 0,
  color: "#65726c",
  fontSize: "12.5px",
  lineHeight: 1.55,
};

const emptyStateStyle = {
  padding: "28px 16px",
  textAlign: "center",
  color: "#8a9690",
  fontSize: "12px",
  border: "1px dashed #d7e0db",
  borderRadius: "7px",
};

// =====================================
// USERS
// =====================================
const userListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "535px",
  overflowY: "auto",
  paddingRight: "3px",
};

const userItemStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(170px, 1fr) auto auto",
  alignItems: "center",
  gap: "12px",
  padding: "13px",
  border: "1px solid #e1e8e4",
  borderRadius: "7px",
  background: "#ffffff",
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: 0,
};

const avatarStyle = {
  width: "32px",
  height: "32px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "7px",
  background: "#edf4f0",
  color: "#047857",
  fontSize: "12px",
  fontWeight: "800",
};

const userNameStyle = {
  margin: 0,
  color: "#26332d",
  fontSize: "12.5px",
  fontWeight: "700",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const userEmailStyle = {
  margin: "3px 0 0",
  color: "#8a9690",
  fontSize: "10.5px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const userMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const roleBadgeStyle = {
  padding: "4px 7px",
  borderRadius: "4px",
  background: "#f2f5f3",
  border: "1px solid #dfe6e1",
  color: "#65726c",
  fontSize: "9px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const accountStatusStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "4px 7px",
  border: "1px solid",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: "750",
};

const smallStatusDotStyle = {
  width: "5px",
  height: "5px",
  borderRadius: "50%",
};

const userActionsStyle = {
  display: "flex",
  gap: "5px",
};

const activateButtonStyle = {
  padding: "6px 8px",
  border: "1px solid #b7e4d0",
  borderRadius: "5px",
  background: "#f1fbf6",
  color: "#047857",
  fontSize: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

const deactivateButtonStyle = {
  padding: "6px 8px",
  border: "1px solid #ead9a8",
  borderRadius: "5px",
  background: "#fffdf4",
  color: "#a16207",
  fontSize: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "6px 8px",
  border: "1px solid #f0c4c4",
  borderRadius: "5px",
  background: "#fff8f8",
  color: "#b42318",
  fontSize: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

export default AdminDashboard;
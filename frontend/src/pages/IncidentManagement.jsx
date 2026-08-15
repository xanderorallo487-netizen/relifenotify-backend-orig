import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// COMPONENTS
import AdminLayout from "../components/AdminLayout";

function IncidentManagement() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH INCIDENTS
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/incidents");
      if (response.data.success) {
        setIncidents(response.data.incidents);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // APPROVE INCIDENT
  const approveIncident = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/incidents/approve/${id}`);
      fetchIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  // REJECT INCIDENT
  const rejectIncident = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/incidents/reject/${id}`);
      fetchIncidents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AdminLayout title={"Incident Management Workspace"} subtitle={"Verify, validate, and manage citizen incident reports"}>
      <div style={{ padding: "40px max(20px, 4%)" }}>
        {/* CONTAINER CARD */}
        <div
          style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "800",
                color: "#064e3b",
                letterSpacing: "-0.3px",
              }}
            >
              📋 Incident Verification Desk
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
              Review incoming citizen reports, process status authentications, and dispatch data validation layers.
            </p>
          </div>

          {/* TABLE CONTAINER */}
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <table
              width="100%"
              style={{
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "14px",
                backgroundColor: "#ffffff",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th style={thStyle}>Incident Type</th>
                  <th style={thStyle}>Barangay</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Verification</th>
                  <th style={thStyle}>Reported By</th>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ ...tdStyle, textAlign: "center", color: "#64748b", padding: "40px" }}>
                      Loading data management tables...
                    </td>
                  </tr>
                ) : incidents.length > 0 ? (
                  incidents.map((incident) => (
                    <tr key={incident.id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background 0.2s" }}>
                      <td style={{ ...tdStyle, fontWeight: "700", color: "#0f172a" }}>
                        {incident.incident_type}
                      </td>
                      <td style={tdStyle}>{incident.barangay}</td>
                      <td style={{ ...tdStyle, color: "#475569", maxWidth: "260px" }}>
                        {incident.description}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            background: "#e2e8f0",
                            color: "#334155",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            textTransform: "uppercase"
                          }}
                        >
                          {incident.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            backgroundColor:
                              incident.verification_status === "Approved"
                                ? "#d1fae5"
                                : incident.verification_status === "Rejected"
                                ? "#fee2e2"
                                : "#fffbeb",
                            color:
                              incident.verification_status === "Approved"
                                ? "#065f46"
                                : incident.verification_status === "Rejected"
                                ? "#991b1b"
                                : "#92400e",
                          }}
                        >
                          ● {incident.verification_status || "Pending"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: "13px" }}>{incident.reported_by}</td>
                      <td style={{ ...tdStyle, color: "#64748b", fontSize: "13px" }}>
                        {new Date(incident.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => approveIncident(incident.id)}
                            style={{
                              ...actionBtnStyle,
                              backgroundColor: "#ecfdf5",
                              color: "#065f46",
                              border: "1px solid #a7f3d0",
                            }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = "#d1fae5" }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#ecfdf5" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectIncident(incident.id)}
                            style={{
                              ...actionBtnStyle,
                              backgroundColor: "#fef2f2",
                              color: "#991b1b",
                              border: "1px solid #fca5a5",
                            }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = "#fee2e2" }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#fef2f2" }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ ...tdStyle, textAlign: "center", color: "#64748b", padding: "40px" }}>
                      No current pending incidents logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// =====================================
// SHARED DESIGN STYLES
// =====================================
const thStyle = {
  padding: "14px 16px",
  fontWeight: "700",
  fontSize: "12px",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "16px",
  verticalAlign: "middle",
  color: "#334155",
};

const actionBtnStyle = {
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
  transition: "all 0.15s ease",
};

export default IncidentManagement;
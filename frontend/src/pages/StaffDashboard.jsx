import React from "react";

import StaffHeader from "../components/StaffHeader";
import StaffNavbar from "../components/StaffNavbar";
import StaffFooter from "../components/StaffFooter";

function StaffDashboard() {

  return (

    <div
      style={{
        backgroundColor: "#f4f7f6",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* HEADER */}
      <StaffHeader />

      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <StaffNavbar />
        <main style={{ flex: 1, minWidth: 0, padding: "30px clamp(20px, 4vw, 52px)", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "18px", flexWrap: "wrap", marginBottom: "24px" }}>
            <div>
              <p style={{ color: "#168277", fontSize: "11px", fontWeight: "800", letterSpacing: "1.8px", margin: "0 0 8px" }}>MUNICIPAL RESPONSE DESK</p>
              <h1 style={{ margin: 0, color: "#103d38", fontSize: "30px", lineHeight: 1.1 }}>Command Center</h1>
              <p style={{ color: "#607875", margin: "8px 0 0", fontSize: "14px" }}>A clear view of today&apos;s field operations.</p>
            </div>
            <div style={{ background: "#eaf7df", color: "#3f6c2f", borderRadius: "20px", padding: "8px 13px", fontSize: "12px", fontWeight: "800" }}>
              ● ALL SYSTEMS OPERATIONAL
            </div>
          </div>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "18px" }}>
            {[
              ["01", "Incident Reports", "Review incoming reports", "#d8f36b"],
              ["02", "Evacuation", "Monitor safe capacity", "#b8e7df"],
              ["03", "Relief Requests", "Coordinate assistance", "#ffd99b"]
            ].map(([number, title, detail, color]) => (
              <div key={number} style={{ background: "#ffffff", border: "1px solid #dceae6", borderRadius: "10px", padding: "18px", minHeight: "112px", boxSizing: "border-box", boxShadow: "0 7px 18px rgba(16,61,56,0.06)", borderTop: `4px solid ${color}` }}>
                <span style={{ color: "#168277", fontSize: "11px", fontWeight: "900" }}>{number}</span>
                <h2 style={{ color: "#103d38", fontSize: "16px", margin: "12px 0 5px" }}>{title}</h2>
                <p style={{ color: "#718783", fontSize: "12px", margin: 0 }}>{detail}</p>
              </div>
            ))}
          </section>
          <section style={{ background: "#103d38", color: "white", borderRadius: "10px", padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "#d8f36b", fontSize: "10px", fontWeight: "800", letterSpacing: "1.4px", margin: "0 0 6px" }}>READY FOR DISPATCH</p>
              <h2 style={{ color: "white", margin: 0, fontSize: "19px" }}>Keep the community moving safely.</h2>
            </div>
            <span style={{ color: "#b8e7df", fontSize: "12px" }}>Use the operations rail to open a module.</span>
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <StaffFooter />

    </div>

  );

}

export default StaffDashboard;

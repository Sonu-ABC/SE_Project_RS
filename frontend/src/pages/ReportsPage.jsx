import React from "react";
import Card from "../components/Card.jsx";

/**
 * Reports page — displays static sales, profit, and expense charts.
 * (Data is currently static placeholder; the /api/reports endpoint exists
 *  but this UI uses hardcoded values matching the original implementation.)
 */
function ReportsPage() {
  return (
    <section>
      <div className="cards">
        <Card title="Total sales" value="₹ 1,24,850" tone="green" />
        <Card title="Gross profit" value="₹ 48,200" tone="yellow" />
        <Card title="Expenses" value="₹ 76,650" tone="red" />
      </div>
      <div className="panel chart">
        <div className="section-head">
          <h2>Monthly sales</h2>
          <span>Last 6 months</span>
        </div>
        <div className="bars">
          {[45, 62, 55, 78, 68, 92].map((n, i) => (
            <div key={i}>
              <span style={{ height: n + "%" }}></span>
              <small>{["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i]}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="report-charts">
        <div className="panel chart">
          <div className="section-head">
            <h2>Monthly profit</h2>
            <span>Last 6 months</span>
          </div>
          <div className="bars profit-bars">
            {[35, 48, 42, 61, 54, 76].map((n, i) => (
              <div key={i}>
                <span style={{ height: n + "%" }}></span>
                <small>{["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel chart">
          <div className="section-head">
            <h2>Monthly expenses</h2>
            <span>Last 6 months</span>
          </div>
          <div className="bars expense-bars">
            {[60, 52, 67, 48, 62, 55].map((n, i) => (
              <div key={i}>
                <span style={{ height: n + "%" }}></span>
                <small>{["Apr", "May", "Jun", "Jul", "Aug", "Sep"][i]}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportsPage;

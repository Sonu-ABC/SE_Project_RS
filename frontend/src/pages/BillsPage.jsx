import React from "react";

/**
 * Bills page — shows the most recently paid bill and a static list of recent bills.
 * Props: paidBill — the bill object returned after a successful payment, or null.
 */
function BillsPage({ paidBill }) {
  return (
    <section>
      {paidBill && (
        <div className="panel new-bill">
          <div>
            <b>{paidBill.billNumber}</b>
            <small>Latest online order · Payment successful</small>
          </div>
          <strong>₹{paidBill.totalAmount.toFixed(2)}</strong>
          <button
            className="primary"
            onClick={() => {
              const blob = new Blob(
                [
                  `SAVOURY RESTAURANT\nBill: ${paidBill.billNumber}\nTotal: ₹${paidBill.totalAmount.toFixed(2)}\nThank you!`,
                ],
                { type: "text/plain" }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${paidBill.billNumber}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download bill
          </button>
        </div>
      )}
      <div className="panel">
        <div className="section-head">
          <h2>Recent bills</h2>
          <span>Stored securely</span>
        </div>
        {["B-2048", "B-2047", "B-2046"].map((x, i) => (
          <div className="row" key={x}>
            <div>
              <b>{x}</b>
              <small>
                {i ? "Walk-in sale" : "Online order"} · Today, 10:{20 + i}
              </small>
            </div>
            <strong>₹{[600, 480, 320][i]}</strong>
            <span className="status paid">PAID</span>
            <button className="outline">Get bill</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BillsPage;

/**
 * Bento replacement for the Stakes four-number row.
 * Approved copy only; red accent on the lead number, as in the mock.
 */
const stakes = [
  { amount: "₹2 Cr", label: "in scholarships for standout builders", lead: true, wide: true },
  { amount: "₹25L", label: "in prizes at the grand finale" },
  { amount: "100", label: "finalists build live for 36 hours" },
  { amount: "VCs", label: "hear your pitch on finale day", wide: true },
];

export function BentoStakes() {
  return (
    <ul className="bento-grid">
      {stakes.map((stake) => (
        <li
          key={stake.amount}
          className={["bento", stake.lead ? "lead" : "", stake.wide ? "wide" : ""].filter(Boolean).join(" ")}
        >
          <b>{stake.amount}</b>
          <p>{stake.label}</p>
        </li>
      ))}
    </ul>
  );
}

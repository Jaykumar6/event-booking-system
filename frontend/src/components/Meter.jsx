import { eventState } from "../utils.js";

export default function Meter({ event }) {
  const s = eventState(event);
  const level = s.soldOut ? "full" : s.low ? "low" : "ok";
  return (
    <div className={`meter meter-${level}`} role="img" aria-label={`${s.pct}% of tickets booked`}>
      <i style={{ width: `${s.pct}%` }} />
    </div>
  );
}

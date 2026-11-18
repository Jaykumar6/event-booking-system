import { hash } from "../utils.js";

// Generated cover art: every event gets its own colours + pattern from its id/title,
// so the grid looks designed even though the backend stores no images.
export default function Cover({ event, className = "", children }) {
  const h = hash(`${event._id}${event.title}`);
  const hue = h % 360;
  const hue2 = (hue + 35 + ((h >>> 4) % 45)) % 360;
  const variant = (h >>> 8) % 3;
  const cx = 60 + ((h >>> 3) % 280);

  return (
    <div
      className={`cover ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 62% 44%), hsl(${hue2} 68% 54%))`
      }}
    >
      <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {variant === 0 && (
          <g fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth="2">
            {[30, 60, 90, 120, 150].map((r) => (
              <circle key={r} cx={cx} cy="150" r={r} />
            ))}
          </g>
        )}
        {variant === 1 && (
          <g stroke="#fff" strokeOpacity=".2" strokeWidth="16">
            {[-40, 20, 80, 140, 200, 260, 320, 380].map((x) => (
              <line key={x} x1={x} y1="260" x2={x + 140} y2="-40" />
            ))}
          </g>
        )}
        {variant === 2 && (
          <g fill="#fff">
            <circle cx={cx} cy="120" r="84" fillOpacity=".16" />
            {Array.from({ length: 36 }, (_, i) => (
              <circle key={i} cx={24 + (i % 12) * 34} cy={30 + Math.floor(i / 12) * 34} r="2.4" fillOpacity=".5" />
            ))}
          </g>
        )}
      </svg>
      {children}
    </div>
  );
}

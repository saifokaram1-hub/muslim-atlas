// Muslim-Atlas-Logo: achtzackiger Stern (Rub al-Hizb-Motiv) mit einem
// Wissensnetz im Inneren — Knoten und Verbindungen wie die Mindmaps der App.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className ?? "h-8 w-8"} aria-hidden>
      <defs>
        <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8cd6e" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#b8932c" />
        </linearGradient>
      </defs>
      {/* Achtzackiger Stern aus zwei Quadraten */}
      <rect x="22" y="22" width="56" height="56" rx="6" fill="none" stroke="url(#logoGold)" strokeWidth="4" />
      <rect x="22" y="22" width="56" height="56" rx="6" fill="none" stroke="url(#logoGold)" strokeWidth="4" transform="rotate(45 50 50)" />
      {/* Wissensnetz */}
      <g stroke="#2f9d77" strokeWidth="2.4" opacity="0.95">
        <line x1="50" y1="50" x2="36" y2="40" />
        <line x1="50" y1="50" x2="64" y2="38" />
        <line x1="50" y1="50" x2="40" y2="64" />
        <line x1="50" y1="50" x2="63" y2="61" />
        <line x1="36" y1="40" x2="64" y2="38" opacity="0.5" />
        <line x1="40" y1="64" x2="63" y2="61" opacity="0.5" />
      </g>
      <circle cx="50" cy="50" r="6" fill="url(#logoGold)" />
      <circle cx="36" cy="40" r="3.6" fill="#2f9d77" />
      <circle cx="64" cy="38" r="3.6" fill="#2f9d77" />
      <circle cx="40" cy="64" r="3.6" fill="#2f9d77" />
      <circle cx="63" cy="61" r="3.6" fill="#2f9d77" />
    </svg>
  );
}

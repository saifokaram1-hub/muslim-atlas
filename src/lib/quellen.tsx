// Macht Quellenangaben klickbar, damit jeder Fakt extern nachgeprüft werden kann.
// "Bukhari 3624" -> sunnah.com, "Quran 9:40" -> quran.com, klassische Werke als Text.

const SAMMLUNGEN: Record<string, string> = {
  bukhari: "bukhari",
  muslim: "muslim",
  "abu dawud": "abudawud",
  tirmidhi: "tirmidhi",
  "nasa'i": "nasai",
  nasai: "nasai",
  "ibn majah": "ibnmajah",
  ahmad: "ahmad",
};

export function quelleZuLink(quelle: string): { text: string; url?: string } {
  const q = quelle.trim();

  const quran = q.match(/^Quran\s+(\d+)(?::(\d+))?/i);
  if (quran) {
    const sure = quran[1];
    const vers = quran[2] ?? "1";
    return { text: q, url: `https://quran.com/${sure}/${vers}` };
  }

  for (const [name, slug] of Object.entries(SAMMLUNGEN)) {
    const re = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(\\d+)`, "i");
    const m = q.match(re);
    if (m) return { text: q, url: `https://sunnah.com/${slug}:${m[1]}` };
  }

  return { text: q };
}

export function QuellenListe({ quellen }: { quellen: string[] }) {
  return (
    <ul className="space-y-1">
      {quellen.map((q, i) => {
        const { text, url } = quelleZuLink(q);
        return (
          <li key={i} className="text-sm">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-goldhell underline decoration-dotted hover:text-gold"
                title="Quelle extern nachprüfen"
              >
                {text} ↗
              </a>
            ) : (
              <span className="text-cremedim" title="Klassisches Werk (Druckausgaben variieren)">
                {text}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

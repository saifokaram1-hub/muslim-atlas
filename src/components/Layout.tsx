import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

const navLinkKlasse = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive ? "text-gold" : "text-cremedim hover:text-creme"
  }`;

export function Layout() {
  const { user, profil, abmelden } = useAuth();
  const [offen, setOffen] = useState(false);
  // Quellen-Hinweis unten ist wegklickbar (gemerkt im Browser)
  const [fusszeileZu, setFusszeileZu] = useState(() => {
    try { return localStorage.getItem("fusszeile-zu") === "1"; } catch { return false; }
  });
  const navigate = useNavigate();

  const linksAlle = [
    { zu: "/sira", text: "Sira ﷺ" },
    { zu: "/propheten", text: "Propheten" },
    { zu: "/quran", text: "Quran" },
    { zu: "/hadith", text: "Hadith" },
    { zu: "/gelehrte", text: "Gelehrte" },
    { zu: "/hifz", text: "Hifz" },
    { zu: "/lernen", text: "Lernen" },
    { zu: "/bibliothek", text: "Bibliothek" },
    ...(user ? [{ zu: "/meine-maps", text: "Meine Maps" }, { zu: "/notizen", text: "Notizen" }] : []),
    ...(profil?.role === "admin" ? [{ zu: "/admin", text: "Admin" }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-gold/20 bg-grund/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-serif text-xl text-gold">Muslim-Atlas</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {linksAlle.map((l) => (
              <NavLink key={l.zu} to={l.zu} className={navLinkKlasse}>
                {l.text}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/willkommen" title="Einstellungen: Wissensstufen & Design" className="text-cremedim hover:text-gold text-lg">⚙</Link>
                <span className="text-sm text-cremedim">
                  {profil?.username ?? user.email}
                </span>
                <button
                  className="knopf text-sm py-1.5"
                  onClick={async () => {
                    await abmelden();
                    navigate("/");
                  }}
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="knopf text-sm py-1.5">Anmelden</Link>
                <Link to="/registrieren" className="knopf knopf-gold text-sm py-1.5">Registrieren</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-creme text-2xl" onClick={() => setOffen(!offen)} aria-label="Menü">
            ☰
          </button>
        </div>

        {offen && (
          <div className="md:hidden border-t border-gold/20 bg-flaeche px-4 py-3 space-y-2">
            {linksAlle.map((l) => (
              <NavLink key={l.zu} to={l.zu} className="block text-creme py-1" onClick={() => setOffen(false)}>
                {l.text}
              </NavLink>
            ))}
            {user ? (
              <button
                className="knopf w-full mt-2"
                onClick={async () => {
                  await abmelden();
                  setOffen(false);
                  navigate("/");
                }}
              >
                Abmelden
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <Link to="/login" className="knopf flex-1 text-center" onClick={() => setOffen(false)}>Anmelden</Link>
                <Link to="/registrieren" className="knopf knopf-gold flex-1 text-center" onClick={() => setOffen(false)}>Registrieren</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {fusszeileZu ? (
        <footer className="border-t border-gold/10 py-1.5 text-center">
          <Link to="/quellen" className="text-xs text-goldhell underline">Quellenverzeichnis</Link>
        </footer>
      ) : (
        <footer className="relative border-t border-gold/20 py-6 text-center text-sm text-cremedim px-10">
          <button
            className="absolute top-2 right-3 text-cremedim hover:text-creme text-lg leading-none"
            aria-label="Hinweis ausblenden"
            title="Hinweis ausblenden (Quellenverzeichnis bleibt unten erreichbar)"
            onClick={() => {
              setFusszeileZu(true);
              try { localStorage.setItem("fusszeile-zu", "1"); } catch { /* still */ }
            }}
          >
            ✕
          </button>
          <p>
            Muslim-Atlas: Kuratierte Daten aus Ibn Hisham, ar-Rahiq al-Makhtum, den sechs Hadith-Sammlungen
            und dem Quran. Jede Angabe trägt ihre Quelle; externe Prüfung via{" "}
            <a href="https://sunnah.com" target="_blank" rel="noopener noreferrer" className="text-goldhell underline">sunnah.com</a>{" "}
            und{" "}
            <a href="https://quran.com" target="_blank" rel="noopener noreferrer" className="text-goldhell underline">quran.com</a>.
          </p>
          <p className="mt-2">
            <Link to="/quellen" className="text-goldhell underline font-medium">Vollständiges Quellenverzeichnis ansehen →</Link>
          </p>
        </footer>
      )}
    </div>
  );
}

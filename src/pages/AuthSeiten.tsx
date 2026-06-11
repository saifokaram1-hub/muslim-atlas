import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function AuthRahmen({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 muster">
      <div className="karte p-7 w-full max-w-md">
        <h1 className="font-serif text-2xl text-gold mb-5">{titel}</h1>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [lädt, setLädt] = useState(false);
  const navigate = useNavigate();

  const absenden = async (e: FormEvent) => {
    e.preventDefault();
    setFehler("");
    setLädt(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: passwort });
    setLädt(false);
    if (error) setFehler("Anmeldung fehlgeschlagen: " + error.message);
    else navigate("/sira");
  };

  return (
    <AuthRahmen titel="Anmelden">
      <form onSubmit={absenden} className="space-y-3">
        <input className="eingabe" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="eingabe" type="password" placeholder="Passwort" value={passwort} onChange={(e) => setPasswort(e.target.value)} required />
        {fehler && <p className="text-sm text-warn">{fehler}</p>}
        <button className="knopf knopf-gold w-full" disabled={lädt}>{lädt ? "Wird geprüft..." : "Anmelden"}</button>
      </form>
      <div className="mt-4 text-sm text-cremedim space-y-1">
        <p><Link to="/passwort-vergessen" className="text-goldhell underline">Passwort vergessen?</Link></p>
        <p>Noch kein Konto? <Link to="/registrieren" className="text-goldhell underline">Jetzt registrieren</Link></p>
      </div>
    </AuthRahmen>
  );
}

export function Registrieren() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);
  const [lädt, setLädt] = useState(false);
  const navigate = useNavigate();

  const absenden = async (e: FormEvent) => {
    e.preventDefault();
    setFehler("");
    if (username.trim().length < 3) {
      setFehler("Der Username braucht mindestens 3 Zeichen.");
      return;
    }
    setLädt(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwort,
      options: { data: { username: username.trim() } },
    });
    if (!error && data.session) {
      navigate("/sira");
      return;
    }
    setLädt(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("rate limit")) {
        setFehler("Unser E-Mail-Versand hat gerade sein Limit erreicht. Bitte versuche es in etwa einer Stunde erneut; dein Konto wurde noch nicht angelegt.");
      } else if (msg.includes("already registered")) {
        setFehler("Diese E-Mail ist bereits registriert. Du kannst dich anmelden oder das Passwort zurücksetzen.");
      } else {
        setFehler("Registrierung fehlgeschlagen: " + error.message);
      }
    } else setFertig(true);
  };

  if (fertig) {
    return (
      <AuthRahmen titel="Fast geschafft">
        <p className="text-creme">
          Wir haben dir eine Bestätigungs-E-Mail geschickt. Bitte klicke auf den Link darin,
          dann kannst du dich <Link to="/login" className="text-goldhell underline">anmelden</Link>.
        </p>
      </AuthRahmen>
    );
  }

  return (
    <AuthRahmen titel="Konto erstellen">
      <form onSubmit={absenden} className="space-y-3">
        <input className="eingabe" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        <input className="eingabe" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="eingabe" type="password" placeholder="Passwort (mind. 6 Zeichen)" value={passwort} onChange={(e) => setPasswort(e.target.value)} required minLength={6} />
        {fehler && <p className="text-sm text-warn">{fehler}</p>}
        <button className="knopf knopf-gold w-full" disabled={lädt}>{lädt ? "Wird erstellt..." : "Registrieren"}</button>
      </form>
      <p className="mt-4 text-sm text-cremedim">
        Mit dem Konto kannst du an jedem Knoten eigene Notizen speichern.
      </p>
    </AuthRahmen>
  );
}

export function PasswortVergessen() {
  const [email, setEmail] = useState("");
  const [fertig, setFertig] = useState(false);
  const [fehler, setFehler] = useState("");
  const [lädt, setLädt] = useState(false);

  const absenden = async (e: FormEvent) => {
    e.preventDefault();
    setFehler("");
    setLädt(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}passwort-aendern`,
    });
    setLädt(false);
    if (error) setFehler(error.message);
    else setFertig(true);
  };

  return (
    <AuthRahmen titel="Passwort zurücksetzen">
      {fertig ? (
        <p className="text-creme">
          Wenn ein Konto mit dieser E-Mail existiert, haben wir dir soeben einen Link zum
          Zurücksetzen geschickt. Bitte prüfe dein Postfach.
        </p>
      ) : (
        <form onSubmit={absenden} className="space-y-3">
          <p className="text-sm text-cremedim">
            Gib deine E-Mail ein; du erhältst einen Link, mit dem du ein neues Passwort setzen kannst.
          </p>
          <input className="eingabe" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {fehler && <p className="text-sm text-warn">{fehler}</p>}
          <button className="knopf knopf-gold w-full" disabled={lädt}>{lädt ? "Sendet..." : "Link anfordern"}</button>
        </form>
      )}
    </AuthRahmen>
  );
}

export function PasswortÄndern() {
  const [passwort, setPasswort] = useState("");
  const [wiederholen, setWiederholen] = useState("");
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);
  const [lädt, setLädt] = useState(false);
  const navigate = useNavigate();

  const absenden = async (e: FormEvent) => {
    e.preventDefault();
    setFehler("");
    if (passwort !== wiederholen) {
      setFehler("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLädt(true);
    const { error } = await supabase.auth.updateUser({ password: passwort });
    setLädt(false);
    if (error) setFehler(error.message);
    else {
      setFertig(true);
      setTimeout(() => navigate("/sira"), 1800);
    }
  };

  return (
    <AuthRahmen titel="Neues Passwort setzen">
      {fertig ? (
        <p className="text-creme">Passwort geändert. Du wirst weitergeleitet...</p>
      ) : (
        <form onSubmit={absenden} className="space-y-3">
          <input className="eingabe" type="password" placeholder="Neues Passwort (mind. 6 Zeichen)" value={passwort} onChange={(e) => setPasswort(e.target.value)} required minLength={6} />
          <input className="eingabe" type="password" placeholder="Neues Passwort wiederholen" value={wiederholen} onChange={(e) => setWiederholen(e.target.value)} required minLength={6} />
          {fehler && <p className="text-sm text-warn">{fehler}</p>}
          <button className="knopf knopf-gold w-full" disabled={lädt}>{lädt ? "Speichert..." : "Passwort speichern"}</button>
        </form>
      )}
    </AuthRahmen>
  );
}

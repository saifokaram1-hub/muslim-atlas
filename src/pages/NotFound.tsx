import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 muster">
      <p className="font-serif text-6xl text-gold">404</p>
      <p className="text-cremedim mt-3">Diese Seite gibt es im Atlas nicht.</p>
      <Link to="/" className="knopf knopf-gold mt-6">Zur Startseite</Link>
    </div>
  );
}

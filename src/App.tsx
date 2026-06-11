import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { logEvent } from "./lib/analytics";
import Landing from "./pages/Landing";
import SiraPage from "./pages/SiraPage";
import HadithÜbersicht from "./pages/HadithUebersicht";
import HadithBuchSeite from "./pages/HadithBuchSeite";
import HadithDetail from "./pages/HadithDetail";
import { Login, Registrieren, PasswortVergessen, PasswortÄndern } from "./pages/AuthSeiten";
import ProphetenPage from "./pages/ProphetenPage";
import QuranPage from "./pages/QuranPage";
import GelehrtePage from "./pages/GelehrtePage";
import Lernen from "./pages/Lernen";
import QuranLernen from "./pages/QuranLernen";
import Quellen from "./pages/Quellen";
import Notizen from "./pages/Notizen";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function PageViewLogger() {
  const location = useLocation();
  useEffect(() => {
    logEvent("page_view", { path: location.pathname });
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <PageViewLogger />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/sira" element={<SiraPage />} />
          <Route path="/propheten" element={<ProphetenPage />} />
          <Route path="/quran" element={<QuranPage />} />
          <Route path="/gelehrte" element={<GelehrtePage />} />
          <Route path="/lernen" element={<Lernen />} />
          <Route path="/hifz" element={<QuranLernen />} />
          <Route path="/quellen" element={<Quellen />} />
          <Route path="/hadith" element={<HadithÜbersicht />} />
          <Route path="/hadith/:buchId" element={<HadithBuchSeite />} />
          <Route path="/hadith/:buchId/:hadithId" element={<HadithDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrieren" element={<Registrieren />} />
          <Route path="/passwort-vergessen" element={<PasswortVergessen />} />
          <Route path="/passwort-aendern" element={<PasswortÄndern />} />
          <Route path="/notizen" element={<Notizen />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

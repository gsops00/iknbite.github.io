import { Routes, Route } from "react-router-dom";
import { SiteHeader } from "~/components/SiteHeader";
import { SiteFooter } from "~/components/SiteFooter";
import LandingPage from "./routes/index";
import StudioPage from "./routes/studio";
import VoicesPage from "./routes/voices";
import HistoryPage from "./routes/history";
import SettingsPage from "./routes/settings";
import "~/styles.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/voices" element={<VoicesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

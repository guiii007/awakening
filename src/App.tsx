import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import TradeoffPage from "@/pages/TradeoffPage";
import ChatPage from "@/pages/ChatPage";
import ReviewPage from "@/pages/ReviewPage";
import RescuePage from "@/pages/RescuePage";
import StatsPage from "@/pages/StatsPage";
import AlternativesPage from "@/pages/AlternativesPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tradeoff" element={<TradeoffPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/rescue" element={<RescuePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/alternatives" element={<AlternativesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

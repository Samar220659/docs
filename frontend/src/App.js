import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./components/Dashboard";
import PayPalPayment from "./components/PayPalPayment";
import AutomationHub from "./components/AutomationHub";
import Analytics from "./components/Analytics";
import SaasLaunch from "./components/SaasLaunch";
import ControlCenter from "./components/ControlCenter";
import AutomationControl from "./components/AutomationControl";
import EasyAutomation from "./components/EasyAutomation";
import AIMarketingHub from "./components/AIMarketingHub";
import DigitalManager from "./components/DigitalManager";
import AutonomousHub from "./components/AutonomousHub";
import ProductionLaunch from "./components/ProductionLaunch";
import HyperSwarm from "./components/HyperSwarm";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/payment" element={<PayPalPayment />} />
          <Route path="/automation" element={<AutomationHub />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/saas" element={<SaasLaunch />} />
          <Route path="/control" element={<ControlCenter />} />
          <Route path="/automation-control" element={<AutomationControl />} />
          <Route path="/easy-automation" element={<EasyAutomation />} />
          <Route path="/ai-marketing" element={<AIMarketingHub />} />
          <Route path="/digital-manager" element={<DigitalManager />} />
          <Route path="/autonomous-hub" element={<AutonomousHub />} />
          <Route path="/production-launch" element={<ProductionLaunch />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
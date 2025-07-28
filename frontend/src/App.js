import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./components/Dashboard";
import PayPalPayment from "./components/PayPalPayment";
import AutomationHub from "./components/AutomationHub";
import Analytics from "./components/Analytics";
import SaasLaunch from "./components/SaasLaunch";
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
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
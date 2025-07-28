import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  Rocket, 
  Settings, 
  Play, 
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Server,
  Database,
  Shield,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { mockData } from "../utils/mock";

export default function SaasLaunch() {
  const navigate = useNavigate();
  const [saasStatus, setSaasStatus] = useState(mockData.saasStatus);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);

  const handleLaunchSystem = async () => {
    setIsLaunching(true);
    setLaunchProgress(0);
    
    // Simulate launch process
    const steps = [
      { progress: 20, message: "Initialisiere SaaS-Komponenten..." },
      { progress: 40, message: "Starte Lead Generation Engine..." },
      { progress: 60, message: "Aktiviere Payment Processing..." },
      { progress: 80, message: "Optimiere Performance..." },
      { progress: 100, message: "SaaS System erfolgreich gestartet!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLaunchProgress(step.progress);
      toast.success(step.message);
    }

    setIsLaunching(false);
    toast.success("🚀 SaaS System ist LIVE und bereit für Kunden!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      case 'offline': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'maintenance': return 'Wartung';
      case 'offline': return 'Offline';
      default: return 'Unbekannt';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">SaaS Launch Control</h1>
                <p className="text-sm text-gray-400">System Management Dashboard</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Rocket className="w-3 h-3 mr-2" />
              SaaS Control
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* System Overview */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              System Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{saasStatus.systemHealth}%</div>
                <div className="text-sm text-gray-400">System Health</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{saasStatus.uptime}</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{saasStatus.activeUsers}</div>
                <div className="text-sm text-gray-400">Aktive Benutzer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">+{saasStatus.monthlyGrowth}%</div>
                <div className="text-sm text-gray-400">Monatl. Wachstum</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesamt Performance</span>
                <span className="text-sm text-green-400">{saasStatus.systemHealth}%</span>
              </div>
              <Progress value={saasStatus.systemHealth} className="h-3" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesamt Umsatz</span>
                <span className="text-xl font-bold text-green-400">€{saasStatus.totalRevenue}</span>
              </div>
              <div className="text-sm text-gray-400">
                Automatisierte Einnahmen seit System-Start
              </div>
            </div>

            {isLaunching ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Launch Progress</span>
                  <span className="text-sm text-blue-400">{launchProgress}%</span>
                </div>
                <Progress value={launchProgress} className="h-3" />
                <div className="text-center text-sm text-gray-400">
                  SaaS System wird gestartet... Bitte warten.
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleLaunchSystem}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12"
              >
                <Play className="mr-2 h-4 w-4" />
                SaaS System Starten
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Component Status */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              System Komponenten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {saasStatus.components.map((component, index) => (
                <div key={index} className="p-4 bg-black/40 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">{component.name}</h3>
                    <Badge variant="secondary" className={getStatusColor(component.status)}>
                      {getStatusIcon(component.status)}
                      <span className="ml-1">{getStatusText(component.status)}</span>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Performance:</span>
                      <span className="font-medium">{component.performance}%</span>
                    </div>
                    <Progress value={component.performance} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Schnellaktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Database className="h-6 w-6 mb-2" />
                <span className="text-sm">Datenbank</span>
                <span className="text-xs text-gray-400">Optimieren</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Shield className="h-6 w-6 mb-2" />
                <span className="text-sm">Sicherheit</span>
                <span className="text-xs text-gray-400">Scannen</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Globe className="h-6 w-6 mb-2" />
                <span className="text-sm">CDN</span>
                <span className="text-xs text-gray-400">Aktualisieren</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="h-6 w-6 mb-2" />
                <span className="text-sm">Einstellungen</span>
                <span className="text-xs text-gray-400">Konfigurieren</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
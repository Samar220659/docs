import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  Bot, 
  Users, 
  Share2, 
  Mail, 
  DollarSign,
  Settings,
  Play,
  Pause,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { mockData } from "../utils/mock";

export default function AutomationHub() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState(mockData.automations);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleToggleAutomation = (id) => {
    setAutomations(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { ...automation, active: !automation.active }
          : automation
      )
    );
    
    const automation = automations.find(a => a.id === id);
    if (automation) {
      toast.success(`${automation.name} ${automation.active ? 'deaktiviert' : 'aktiviert'}`);
    }
  };

  const handleOptimizeSystem = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      toast.success("System erfolgreich optimiert!");
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'paused': return 'Pausiert';
      case 'inactive': return 'Inaktiv';
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
                <h1 className="text-xl font-bold">Automation Hub</h1>
                <p className="text-sm text-gray-400">24/7 Marketing Automation</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Bot className="w-3 h-3 mr-2" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* System Overview */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {automations.filter(a => a.active).length}/5
                </div>
                <div className="text-sm text-gray-400">Aktive Automationen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">247</div>
                <div className="text-sm text-gray-400">Generierte Leads heute</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">€1,247</div>
                <div className="text-sm text-gray-400">Automatisierte Einnahmen</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gesamtperformance</span>
                <span className="text-sm text-green-400">Optimal</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <Button 
              onClick={handleOptimizeSystem}
              disabled={isOptimizing}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  System wird optimiert...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  System Optimieren
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Automation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((automation) => (
            <Card key={automation.id} className="bg-black/40 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <automation.icon className="h-5 w-5" style={{ color: automation.color }} />
                    {automation.name}
                  </CardTitle>
                  <Switch
                    checked={automation.active}
                    onCheckedChange={() => handleToggleAutomation(automation.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">{automation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="secondary" className={getStatusColor(automation.status)}>
                      {getStatusText(automation.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance:</span>
                      <span className="font-medium">{automation.performance}%</span>
                    </div>
                    <Progress value={automation.performance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Heute generiert:</div>
                      <div className="font-medium">{automation.todayGenerated}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Erfolgsrate:</div>
                      <div className="font-medium text-green-400">{automation.successRate}%</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Settings className="mr-2 h-3 w-3" />
                      Konfigurieren
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <TrendingUp className="mr-2 h-3 w-3" />
                      Statistiken
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-black/40 border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Schnellaktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Play className="h-6 w-6 mb-1" />
                <span className="text-sm">Alle starten</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Pause className="h-6 w-6 mb-1" />
                <span className="text-sm">Alle pausieren</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="h-6 w-6 mb-1" />
                <span className="text-sm">Bulk-Konfiguration</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Bot, 
  QrCode, 
  Smartphone,
  Play,
  Settings,
  BarChart3,
  Zap,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { dashboardApi } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayEarnings: "0.00",
    todayGrowth: 0,
    activeLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    activeAutomations: 0,
    systemPerformance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Fehler beim Laden der Dashboard-Daten');
      toast.error('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">ZZ-Lobby Elite lädt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
          <Button 
            onClick={fetchDashboardStats}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
          >
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-black">
                ZZ
              </div>
              <div>
                <h1 className="text-xl font-bold">ZZ-Lobby Elite</h1>
                <p className="text-sm text-gray-400">Mobile SaaS Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => handleNavigation('/control')}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold"
              >
                <Crown className="mr-2 h-4 w-4" />
                Control Center
              </Button>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Heute Verdient</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">€{stats.todayEarnings}</div>
              <p className="text-xs text-green-400">+{stats.todayGrowth}% vom Vortag</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Aktive Leads</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeLeads}</div>
              <p className="text-xs text-blue-400">+{stats.newLeads} neue heute</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversionRate}%</div>
              <p className="text-xs text-purple-400">Letzten 7 Tage</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Automationen</CardTitle>
              <Bot className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeAutomations}/5</div>
              <p className="text-xs text-green-400">Aktiv und optimiert</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/payment')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <QrCode className="h-8 w-8 text-yellow-400" />
                <div className="text-right">
                  <div className="text-sm text-yellow-400">PayPal</div>
                  <div className="text-xs text-gray-400">QR-Code</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Sofort-Zahlung</h3>
              <p className="text-sm text-gray-400">QR-Code generieren & Payment-Link teilen</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/automation')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <div className="text-right">
                  <div className="text-sm text-blue-400">24/7</div>
                  <div className="text-xs text-gray-400">Automation</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Automation Hub</h3>
              <p className="text-sm text-gray-400">Leads, Social Media & Marketing automatisieren</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-8 w-8 text-green-400" />
                <div className="text-right">
                  <div className="text-sm text-green-400">Live</div>
                  <div className="text-xs text-gray-400">Analytics</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Analytics</h3>
              <p className="text-sm text-gray-400">Umsatz, Conversion & ROI live verfolgen</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleNavigation('/digital-manager')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">🤖</div>
                <div className="text-right">
                  <div className="text-sm text-purple-400">KI</div>
                  <div className="text-xs text-gray-400">Manager</div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Digital Manager</h3>
              <p className="text-sm text-gray-400">Versicherung, Steuer-KI & Rechtsdokumente</p>
            </CardContent>
          </Card>
        </div>

        {/* SaaS System Status */}
        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              SaaS System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Performance</span>
                <span className="text-sm text-green-400">Optimal</span>
              </div>
              <Progress value={stats.systemPerformance} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lead Generation Engine</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Aktiv
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Processing</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Online
                </Badge>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                onClick={() => handleNavigation('/saas')}
              >
                <Play className="mr-2 h-4 w-4" />
                SaaS System Optimieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile App Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-400" />
                Mobile Installation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Installiere die App auf deinem Home-Bildschirm für schnellen Zugriff
              </p>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Smartphone className="mr-2 h-4 w-4" />
                Installationsanleitung
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Erweiterte Einstellungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Konfiguriere erweiterte Automationen und White-Label Optionen
              </p>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen öffnen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
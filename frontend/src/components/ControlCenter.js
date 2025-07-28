import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { 
  Crown, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Bot, 
  Settings,
  Shield,
  Zap,
  BarChart3,
  Target,
  Gem,
  Award,
  Star,
  Briefcase,
  Clock,
  Globe,
  Loader2,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { dashboardApi, paypalApi, automationApi, analyticsApi, saasApi } from "../services/api";

export default function ControlCenter() {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [automations, setAutomations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [saasStatus, setSaasStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [executingAction, setExecutingAction] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      const [dashboardData, automationsData, analyticsData, saasData, paymentsData] = await Promise.all([
        dashboardApi.getStats(),
        automationApi.getAutomations(),
        analyticsApi.getAnalytics(),
        saasApi.getStatus(),
        paypalApi.getPayments()
      ]);

      setDashboardStats(dashboardData);
      setAutomations(automationsData);
      setAnalytics(analyticsData);
      setSaasStatus(saasData);
      setRecentPayments(paymentsData.slice(0, 3));
    } catch (error) {
      console.error('Error loading control center data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (actionName, actionFunc) => {
    setExecutingAction(actionName);
    try {
      await actionFunc();
      toast.success(`${actionName} erfolgreich ausgeführt`);
      await loadAllData(); // Refresh data
    } catch (error) {
      console.error(`Error executing ${actionName}:`, error);
      toast.error(`Fehler bei ${actionName}`);
    } finally {
      setExecutingAction(null);
    }
  };

  const toggleAutomation = async (automationId) => {
    const automation = automations.find(a => a.id === automationId);
    if (!automation) return;

    try {
      await automationApi.toggleAutomation(automationId, !automation.active);
      setAutomations(prev => 
        prev.map(a => 
          a.id === automationId 
            ? { ...a, active: !a.active, status: !a.active ? 'active' : 'inactive' }
            : a
        )
      );
      toast.success(`${automation.name} ${automation.active ? 'deaktiviert' : 'aktiviert'}`);
    } catch (error) {
      console.error('Error toggling automation:', error);
      toast.error('Fehler beim Umschalten der Automation');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <Loader2 className="h-6 w-6 animate-spin text-yellow-400 absolute top-5 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-yellow-200 text-lg font-medium font-serif">Elite Control Room wird geladen...</p>
        </div>
      </div>
    );
  }

  const activeAutomations = automations.filter(a => a.active).length;
  const totalRevenue = analytics?.revenue.month || 0;
  const systemHealth = saasStatus?.systemHealth || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
      {/* Luxurious Header */}
      <div className="bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 backdrop-blur-sm border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-yellow-200 hover:bg-yellow-400/10 border border-yellow-400/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Crown className="h-12 w-12 text-yellow-400" />
                  <Gem className="h-4 w-4 text-yellow-200 absolute top-1 right-1" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-yellow-200 font-serif">Elite Control Room</h1>
                  <p className="text-yellow-400/80 font-serif italic">Deutsches Prestige Management • Est. 2025</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-serif border-yellow-300 px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Executive Access
              </Badge>
              <div className="text-right">
                <div className="text-yellow-200 font-serif text-sm">System Status</div>
                <div className="text-yellow-400 font-bold">{systemHealth}% Operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Executive Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-900/40 to-yellow-900/30 border-yellow-400/30 backdrop-blur-sm animate-pulse">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-200 font-serif flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                Revenue Empire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400 font-serif mb-2">€{totalRevenue.toLocaleString()}</div>
              <div className="text-yellow-200/80 text-sm">Monthly Performance</div>
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-semibold">+{analytics?.revenue.growth || 0}%</span>
              </div>
              <div className="mt-2 text-xs text-yellow-300">🚀 LIVE SYSTEM ACTIVE</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-blue-400/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-200 font-serif flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Clientele Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 font-serif mb-2">{analytics?.leads.total || 0}</div>
              <div className="text-blue-200/80 text-sm">Elite Prospects</div>
              <div className="mt-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400 font-semibold">{analytics?.leads.conversionRate || 0}% Conversion</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 border-green-400/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-200 font-serif flex items-center gap-2">
                <Bot className="h-5 w-5 text-green-400" />
                Automation Suite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 font-serif mb-2">{activeAutomations}/{automations.length}</div>
              <div className="text-green-200/80 text-sm">Active Systems</div>
              <div className="mt-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Premium Grade</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-purple-400/30 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 font-serif mb-2">{systemHealth}%</div>
              <div className="text-purple-200/80 text-sm">Infrastructure</div>
              <div className="mt-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Excellent</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Commands */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Automation Control */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-amber-900/20 border-yellow-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-serif flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-yellow-400" />
                Executive Automation Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {automations.slice(0, 3).map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-yellow-400/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="text-yellow-200 font-semibold font-serif">{automation.name}</div>
                      <div className="text-yellow-400/80 text-sm">{automation.performance}% Performance</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${automation.active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {automation.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={automation.active}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                      className="data-[state=checked]:bg-yellow-400"
                    />
                  </div>
                </div>
              ))}
              <Button 
                onClick={() => navigate('/automation-control')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-serif font-semibold"
              >
                <Bot className="mr-2 h-4 w-4" />
                Digitaler Zwilling
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-green-900/20 border-green-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-200 font-serif flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-green-400/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <div className="text-green-200 font-semibold font-serif">€{payment.amount}</div>
                        <div className="text-green-400/80 text-sm">{payment.description}</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {payment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-green-400/60">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-serif">No recent transactions</p>
                </div>
              )}
              <Button 
                onClick={() => navigate('/payment')}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-serif font-semibold"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Create Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Master Controls */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-purple-900/20 border-purple-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-400" />
              Master Executive Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => executeAction('System Optimization', () => automationApi.optimizeSystem())}
                disabled={executingAction === 'System Optimization'}
                className="h-24 bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-serif font-bold flex flex-col items-center justify-center"
              >
                {executingAction === 'System Optimization' ? (
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                ) : (
                  <Zap className="h-6 w-6 mb-2" />
                )}
                <span>System Optimization</span>
              </Button>

              <Button 
                onClick={() => executeAction('SaaS Launch', () => saasApi.launchSystem())}
                disabled={executingAction === 'SaaS Launch'}
                className="h-24 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-serif font-bold flex flex-col items-center justify-center"
              >
                {executingAction === 'SaaS Launch' ? (
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                ) : (
                  <Globe className="h-6 w-6 mb-2" />
                )}
                <span>SaaS Launch</span>
              </Button>

              <Button 
                onClick={() => navigate('/analytics')}
                className="h-24 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-serif font-bold flex flex-col items-center justify-center"
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>Analytics Suite</span>
              </Button>

              <Button 
                onClick={() => navigate('/saas')}
                className="h-24 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-serif font-bold flex flex-col items-center justify-center"
              >
                <Settings className="h-6 w-6 mb-2" />
                <span>SaaS Control</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-yellow-400/60">
            <Clock className="h-4 w-4" />
            <span className="font-serif text-sm">Last updated: {new Date().toLocaleTimeString('de-DE')}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-serif text-sm">All systems operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
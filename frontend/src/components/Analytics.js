import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";
import { mockData } from "../utils/mock";

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(mockData.analytics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Analytics werden geladen...</p>
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Real-Time Analytics</h1>
                <p className="text-sm text-gray-400">Live Performance Dashboard</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-2" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Revenue Analytics */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Umsatz Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">€{analytics.revenue.today}</div>
                <div className="text-sm text-gray-400">Heute</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">€{analytics.revenue.week}</div>
                <div className="text-sm text-gray-400">Diese Woche</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">€{analytics.revenue.month}</div>
                <div className="text-sm text-gray-400">Dieser Monat</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">+{analytics.revenue.growth}%</div>
                <div className="text-sm text-gray-400">Wachstum</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Analytics */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Lead Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gesamt Leads:</span>
                  <span className="text-xl font-bold text-blue-400">{analytics.leads.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qualifizierte Leads:</span>
                  <span className="text-xl font-bold text-purple-400">{analytics.leads.qualified}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Konvertierte Leads:</span>
                  <span className="text-xl font-bold text-green-400">{analytics.leads.converted}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Conversion Rate:</span>
                  <span className="text-xl font-bold text-yellow-400">{analytics.leads.conversionRate}%</span>
                </div>
                <Progress value={analytics.leads.conversionRate} className="h-3" />
                <div className="text-sm text-gray-400">
                  {analytics.leads.converted} von {analytics.leads.total} Leads konvertiert
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Traffic Quellen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Organisch:</span>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.traffic.organic} className="h-2 w-24" />
                  <span className="text-sm font-bold text-green-400">{analytics.traffic.organic}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bezahlt:</span>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.traffic.paid} className="h-2 w-24" />
                  <span className="text-sm font-bold text-blue-400">{analytics.traffic.paid}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Referral:</span>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.traffic.referral} className="h-2 w-24" />
                  <span className="text-sm font-bold text-purple-400">{analytics.traffic.referral}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Direkt:</span>
                <div className="flex items-center gap-2">
                  <Progress value={analytics.traffic.direct} className="h-2 w-24" />
                  <span className="text-sm font-bold text-yellow-400">{analytics.traffic.direct}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-400" />
              Plattform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.platforms.map((platform, index) => (
                <div key={index} className="p-4 bg-black/40 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{platform.name}</h3>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {platform.leads} Leads
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance:</span>
                      <span className="font-medium">{platform.performance}%</span>
                    </div>
                    <Progress value={platform.performance} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
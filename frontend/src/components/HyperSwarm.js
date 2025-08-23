import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Zap, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Activity,
  Globe,
  MessageSquare,
  Bot,
  ArrowUp,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Crown,
  Flame
} from "lucide-react";
import { toast } from "sonner";

export default function HyperSwarm() {
  const [swarmStatus, setSwarmStatus] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activatingSwarm, setActivatingSwarm] = useState(false);

  useEffect(() => {
    fetchSwarmData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSwarmData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSwarmData = async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://zz-lobby-elite-2.preview.emergentagent.com';
      
      // Fetch swarm status
      const statusResponse = await fetch(`${backendUrl}/api/hyper-swarm/status`);
      const statusData = await statusResponse.json();
      setSwarmStatus(statusData);

      // Fetch performance data
      const performanceResponse = await fetch(`${backendUrl}/api/hyper-swarm/performance`);
      const performanceData = await performanceResponse.json();
      setPerformance(performanceData);

      // Fetch dashboard data
      const dashboardResponse = await fetch(`${backendUrl}/api/hyper-swarm/dashboard`);
      const dashboardData = await dashboardResponse.json();
      setDashboard(dashboardData);

    } catch (error) {
      console.error('Error fetching swarm data:', error);
      toast.error('Fehler beim Laden der Hyper-Swarm Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const activateSwarm = async () => {
    try {
      setActivatingSwarm(true);
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://zz-lobby-elite-2.preview.emergentagent.com';
      
      const response = await fetch(`${backendUrl}/api/hyper-swarm/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crew_regions: ["DACH", "EU-West", "EU-East", "Global"],
          daily_revenue_target: 3333.0,
          automation_level: "maximum",
          telegram_integration: true
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('🚀 Hyper-Swarm System erfolgreich aktiviert!');
        fetchSwarmData(); // Refresh data
      } else {
        toast.error('Fehler beim Aktivieren des Hyper-Swarm Systems');
      }
    } catch (error) {
      console.error('Error activating swarm:', error);
      toast.error('Fehler beim Aktivieren des Hyper-Swarm Systems');
    } finally {
      setActivatingSwarm(false);
    }
  };

  const generateContent = async (region, contentType) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://zz-lobby-elite-2.preview.emergentagent.com';
      
      const response = await fetch(`${backendUrl}/api/hyper-swarm/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crew_region: region,
          content_type: contentType,
          variations_count: 4
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(`Content für ${region} generiert: "${result.generated_content?.substring(0, 50)}..."`);
      } else {
        toast.error('Fehler beim Generieren des Contents');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Fehler beim Generieren des Contents');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p>Lade Hyper-Swarm System...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🔥</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Hyper-Swarm Ref-Cash-System
              </h1>
              <p className="text-gray-400">€100.000/Monat passive Income-Machine</p>
            </div>
          </div>
          
          {/* Daniel's Data Card */}
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30 mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Daniel Oettel - Master Account
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Steuer-ID:</span> <span className="text-green-400 font-mono">69 377 041 825</span></div>
                    <div><span className="text-gray-400">USt-ID:</span> <span className="text-green-400 font-mono">DE4535548228</span></div>
                    <div><span className="text-gray-400">Telegram:</span> <span className="text-blue-400">@autonomepasiveincome</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-3">Freecash Referral System</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Hauptlink:</span> <span className="text-blue-400 font-mono text-xs">freecash.com/r/danieloettel2024</span></div>
                    <div><span className="text-gray-400">Commission:</span> <span className="text-green-400">30% Lifetime Share</span></div>
                    <div><span className="text-gray-400">Bonus:</span> <span className="text-yellow-400">€50 Startbonus</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status & Activation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* System Status */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Swarm Status:</span>
                  <Badge 
                    variant="secondary" 
                    className={swarmStatus?.status === 'active' 
                      ? "bg-green-500/20 text-green-400 border-green-500/30" 
                      : "bg-red-500/20 text-red-400 border-red-500/30"}
                  >
                    {swarmStatus?.status === 'active' ? 'AKTIV' : 'INAKTIV'}
                  </Badge>
                </div>
                
                {swarmStatus?.crews_active && (
                  <div className="flex items-center justify-between">
                    <span>Aktive Crews:</span>
                    <span className="text-blue-400">{swarmStatus.crews_active}/4</span>
                  </div>
                )}
                
                {swarmStatus?.revenue_target && (
                  <div className="flex items-center justify-between">
                    <span>Revenue Target:</span>
                    <span className="text-green-400">€{swarmStatus.revenue_target.toLocaleString()}/Monat</span>
                  </div>
                )}
                
                {swarmStatus?.telegram_channel && (
                  <div className="flex items-center justify-between">
                    <span>Telegram Channel:</span>
                    <span className="text-blue-400">{swarmStatus.telegram_channel}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activation Control */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-green-400" />
                Swarm Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-400 mb-4">
                  Aktiviere das komplette Hyper-Swarm System für automatische Referral-Generierung
                </p>
                
                <Button 
                  onClick={activateSwarm}
                  disabled={activatingSwarm || swarmStatus?.status === 'active'}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {activatingSwarm ? (
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                  ) : swarmStatus?.status === 'active' ? (
                    <Zap className="mr-2 h-4 w-4" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {activatingSwarm ? 'Aktiviere...' : 
                   swarmStatus?.status === 'active' ? 'Swarm Aktiv' : 
                   'SWARM AKTIVIEREN'}
                </Button>

                {swarmStatus?.status === 'active' && (
                  <div className="text-center">
                    <div className="text-2xl animate-pulse">🚀</div>
                    <p className="text-green-400 text-sm font-medium">System läuft mit maximaler Automatisierung!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Performance Metrics */}
        {performance && performance.live_metrics && (
          <Card className="bg-black/40 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Live Performance Metriken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Today's Stats */}
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{performance.live_metrics.refs_today}</div>
                  <div className="text-sm text-gray-400">Referrals Heute</div>
                  <div className="text-lg font-semibold text-green-400">€{performance.live_metrics.revenue_today}</div>
                  <div className="text-xs text-gray-400">Revenue Heute</div>
                </div>

                {/* Weekly Stats */}
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{performance.live_metrics.refs_this_week}</div>
                  <div className="text-sm text-gray-400">Referrals diese Woche</div>
                  <div className="text-lg font-semibold text-green-400">€{performance.live_metrics.revenue_this_week}</div>
                  <div className="text-xs text-gray-400">Revenue diese Woche</div>
                </div>

                {/* Monthly Stats */}
                <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{performance.live_metrics.refs_this_month}</div>
                  <div className="text-sm text-gray-400">Referrals diesen Monat</div>
                  <div className="text-lg font-semibold text-green-400">€{performance.live_metrics.revenue_this_month}</div>
                  <div className="text-xs text-gray-400">Revenue diesen Monat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regional Crew Performance */}
        {performance && performance.crew_performance && (
          <Card className="bg-black/40 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-400" />
                Regional Crew Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {performance.crew_performance.map((crew, index) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        {crew.crew === 'DACH-Crew' && '🇩🇪'}
                        {crew.crew === 'EU-West-Crew' && '🇪🇺'}
                        {crew.crew === 'EU-East-Crew' && '🇵🇱'}
                        {crew.crew === 'Global-Crew' && '🌍'}
                        {crew.crew}
                      </h4>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                        {Math.round(crew.efficiency)}% Effizienz
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Refs Heute:</span>
                        <span className="text-blue-400 font-medium">{crew.refs_today}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Revenue:</span>
                        <span className="text-green-400 font-medium">€{crew.revenue_today}</span>
                      </div>
                      <Progress value={crew.efficiency} className="h-2 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Trajectory */}
        {performance && performance.revenue_trajectory && (
          <Card className="bg-black/40 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Revenue Trajectory & Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Aktuelle Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Aktueller Monats-Pace:</span>
                      <span className="text-blue-400 font-medium">€{performance.revenue_trajectory.current_monthly_pace.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Projiziertes Monatsende:</span>
                      <span className="text-green-400 font-medium">€{performance.revenue_trajectory.projected_month_end.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">€100k Target ETA:</span>
                      <span className="text-yellow-400 font-medium">{performance.revenue_trajectory['100k_target_eta']}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Confidence Level</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {Math.round(performance.revenue_trajectory.confidence_level)}%
                    </div>
                    <Progress value={performance.revenue_trajectory.confidence_level} className="h-3 mb-2" />
                    <p className="text-sm text-gray-400">Erreichung des €100k Ziels</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Generation Controls */}
        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-400" />
              Content Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Region Controls */}
              <div>
                <h4 className="font-medium mb-4">Regional Content</h4>
                <div className="space-y-3">
                  {['DACH', 'EU-West', 'EU-East', 'Global'].map((region) => (
                    <Button
                      key={region}
                      variant="outline"
                      onClick={() => generateContent(region, 'urgency')}
                      className="w-full justify-start"
                    >
                      {region === 'DACH' && '🇩🇪'}
                      {region === 'EU-West' && '🇪🇺'}
                      {region === 'EU-East' && '🇵🇱'}
                      {region === 'Global' && '🌍'}
                      <span className="ml-2">{region} Content generieren</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Types */}
              <div>
                <h4 className="font-medium mb-4">Content Typen</h4>
                <div className="space-y-3">
                  {[
                    { type: 'urgency', label: 'Urgency Posts', icon: '🚨' },
                    { type: 'social_proof', label: 'Social Proof', icon: '👥' },
                    { type: 'educational', label: 'Educational', icon: '💡' },
                    { type: 'direct_benefit', label: 'Direct Benefit', icon: '💰' }
                  ].map((content) => (
                    <Button
                      key={content.type}
                      variant="outline"
                      onClick={() => generateContent('DACH', content.type)}
                      className="w-full justify-start"
                    >
                      <span>{content.icon}</span>
                      <span className="ml-2">{content.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Insights */}
        {performance && performance.optimization_insights && (
          <Card className="bg-black/40 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cyan-400" />
                KI-Optimierung Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performance.optimization_insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <TrendingUp className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Combined System Stats */}
        {dashboard && dashboard.combined_systems && (
          <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-400" />
                ZZ-Lobby + Hyper-Swarm = MEGA-REVENUE-MACHINE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {dashboard.combined_systems.total_revenue_target}
                  </div>
                  <div className="text-sm text-gray-400">Gesamt Revenue Target</div>
                </div>
                
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {dashboard.combined_systems.combined_autonomy}
                  </div>
                  <div className="text-sm text-gray-400">Kombinierte Autonomie</div>
                </div>
                
                <div className="text-center p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">ZZ-Lobby:</div>
                    <div className="text-lg text-blue-400">{dashboard.combined_systems.zz_lobby_contribution}</div>
                    <div className="text-sm text-gray-400">Hyper-Swarm:</div>
                    <div className="text-lg text-red-400">{dashboard.combined_systems.hyper_swarm_contribution}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
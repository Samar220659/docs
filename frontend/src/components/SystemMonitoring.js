import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Shield,
  Target,
  BarChart3,
  Settings,
  Loader2,
  RefreshCw,
  AlertCircle,
  Crown,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

export default function SystemMonitoring() {
  const navigate = useNavigate();
  
  // States
  const [monitoringData, setMonitoringData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [dependencies, setDependencies] = useState([]);
  const [apiMonitoring, setApiMonitoring] = useState([]);
  const [abTestResults, setAbTestResults] = useState([]);
  const [changes, setChanges] = useState([]);
  const [healthScore, setHealthScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchMonitoringData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitoring/dashboard`);
      const data = response.data;
      
      setMonitoringData(data);
      setSystemHealth(data.system_health);
      setDependencies(data.dependencies || []);
      setApiMonitoring(data.api_monitoring || []);
      setAbTestResults(data.ab_test_results || []);
      setChanges(data.changes || []);
      setHealthScore(data.health_score || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Fehler beim Laden der Monitoring-Daten');
      setIsLoading(false);
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await axios.post(`${API_BASE}/monitoring/start-monitoring`);
      setIsMonitoring(true);
      toast.success('Monitoring gestartet');
    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Fehler beim Starten des Monitoring');
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await axios.post(`${API_BASE}/monitoring/stop-monitoring`);
      setIsMonitoring(false);
      toast.success('Monitoring gestoppt');
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      toast.error('Fehler beim Stoppen des Monitoring');
    }
  };

  const getHealthColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'down': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'slow': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'slow': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium">System Monitoring wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 via-cyan-900/20 to-blue-900/30 backdrop-blur-sm border-b border-blue-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/control')}
                className="text-blue-200 hover:bg-blue-400/10 border border-blue-400/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Activity className="h-10 w-10 text-blue-400" />
                  <Shield className="h-4 w-4 text-cyan-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-blue-200 font-serif">System Monitoring & Health</h1>
                  <p className="text-blue-400/80 font-serif italic">Komplette Überwachung & Optimierung</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className="border-blue-400/20 text-blue-200 hover:bg-blue-400/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-Refresh
              </Button>
              <Button
                onClick={fetchMonitoringData}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Aktualisieren
              </Button>
              <Badge className={`${isMonitoring ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                <Activity className="w-4 h-4 mr-2" />
                {isMonitoring ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overall Health Score */}
        <Card className="bg-black/40 border-blue-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-blue-200 font-serif flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-400" />
              System Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold font-serif ${getHealthColor(healthScore)}`}>
                {healthScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Gesamt-System-Gesundheit
              </div>
            </div>
            <Progress value={healthScore} className="h-4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleStartMonitoring}
                disabled={isMonitoring}
                className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-serif"
              >
                <Play className="mr-2 h-4 w-4" />
                Monitoring Starten
              </Button>
              <Button
                onClick={handleStopMonitoring}
                disabled={!isMonitoring}
                className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-serif"
              >
                <Zap className="mr-2 h-4 w-4" />
                Monitoring Stoppen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health Details */}
        {systemHealth && (
          <Card className="bg-black/40 border-green-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-green-200 font-serif flex items-center gap-2">
                <Server className="h-5 w-5 text-green-400" />
                System Health Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-black/40 rounded-lg border border-green-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-200">CPU Usage</span>
                    <span className="text-lg font-bold text-green-400">{systemHealth.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.cpu_usage} className="h-2" />
                </div>
                
                <div className="p-4 bg-black/40 rounded-lg border border-green-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-200">Memory</span>
                    <span className="text-lg font-bold text-green-400">{systemHealth.memory_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.memory_usage} className="h-2" />
                </div>
                
                <div className="p-4 bg-black/40 rounded-lg border border-green-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-200">Disk Usage</span>
                    <span className="text-lg font-bold text-green-400">{systemHealth.disk_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.disk_usage} className="h-2" />
                </div>
                
                <div className="p-4 bg-black/40 rounded-lg border border-green-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-200">API Response</span>
                    <span className="text-lg font-bold text-green-400">{systemHealth.api_response_time.toFixed(0)}ms</span>
                  </div>
                  <div className="text-xs text-gray-400">Network: {systemHealth.network_latency.toFixed(0)}ms</div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{systemHealth.active_connections}</div>
                  <div className="text-sm text-gray-400">Active Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-yellow-400">{systemHealth.error_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{systemHealth.uptime}</div>
                  <div className="text-sm text-gray-400">System Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dependencies Status */}
        <Card className="bg-black/40 border-purple-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              Dependencies Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dependencies.map((dep, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-purple-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Database className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-200">{dep.service_name}</div>
                      <div className="text-sm text-gray-400">{dep.endpoint}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{dep.response_time.toFixed(0)}ms</div>
                      <div className="text-xs text-gray-400">{new Date(dep.last_check).toLocaleTimeString()}</div>
                    </div>
                    <Badge className={getStatusColor(dep.status)}>
                      {getStatusIcon(dep.status)}
                      <span className="ml-1 capitalize">{dep.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Monitoring */}
        <Card className="bg-black/40 border-yellow-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-serif flex items-center gap-2">
              <Wifi className="h-5 w-5 text-yellow-400" />
              API Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiMonitoring.map((api, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-yellow-400/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Wifi className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="font-medium text-yellow-200">{api.method} {api.endpoint}</div>
                      <div className="text-sm text-gray-400">Expected: {api.expected_status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{api.response_time.toFixed(0)}ms</div>
                      <div className="text-xs text-gray-400">Status: {api.status_code}</div>
                    </div>
                    <Badge className={getStatusColor(api.status)}>
                      {getStatusIcon(api.status)}
                      <span className="ml-1 capitalize">{api.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* A/B Testing Results */}
        {abTestResults.length > 0 && (
          <Card className="bg-black/40 border-pink-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-pink-200 font-serif flex items-center gap-2">
                <Target className="h-5 w-5 text-pink-400" />
                A/B Testing Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {abTestResults.map((result, index) => (
                  <div key={index} className="p-4 bg-black/40 rounded-lg border border-pink-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-pink-200">{result.test_id} - {result.variant}</span>
                      <Badge className={result.statistical_significance ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                        {result.statistical_significance ? 'Signifikant' : 'Nicht signifikant'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Conversion Rate:</span>
                        <span className="font-bold text-pink-400 ml-2">{result.conversion_rate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Sample Size:</span>
                        <span className="font-bold text-blue-400 ml-2">{result.sample_size}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Metric Value:</span>
                        <span className="font-bold text-green-400 ml-2">{result.metric_value.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Confidence:</span>
                        <span className="font-bold text-yellow-400 ml-2">{result.confidence_level}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Detection */}
        {changes.length > 0 && (
          <Card className="bg-black/40 border-red-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-200 font-serif flex items-center gap-2">
                <Eye className="h-5 w-5 text-red-400" />
                Change Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changes.map((change, index) => (
                  <div key={index} className="p-4 bg-black/40 rounded-lg border border-red-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-200">{change.component}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(change.impact_level)}>
                          {change.impact_level}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      Type: {change.change_type} | Detected by: {change.detected_by}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Old Value:</span>
                        <div className="text-red-300 font-mono">{change.old_value}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">New Value:</span>
                        <div className="text-green-300 font-mono">{change.new_value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
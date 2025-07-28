import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  ArrowLeft, 
  Brain, 
  Zap, 
  Target, 
  DollarSign,
  Users,
  TrendingUp,
  MessageCircle,
  Crown,
  Gem,
  Star,
  Loader2,
  Play,
  BarChart3,
  Bot,
  Award
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

export default function AIMarketingHub() {
  const navigate = useNavigate();
  
  // States
  const [aiStatus, setAiStatus] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isRunningCampaign, setIsRunningCampaign] = useState(false);
  const [isRunningSeller, setIsRunningSeller] = useState(false);
  const [campaignResults, setCampaignResults] = useState(null);
  const [sellerResults, setSellerResults] = useState(null);
  const [marketingMessages, setMarketingMessages] = useState([]);
  const [salesScripts, setSalesScripts] = useState([]);

  useEffect(() => {
    fetchAIStatus();
    fetchLeads();
    fetchMarketingContent();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ai-marketing/status`);
      setAiStatus(response.data);
    } catch (error) {
      console.error('Error fetching AI status:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/ai-marketing/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchMarketingContent = async () => {
    try {
      const [messagesResponse, scriptsResponse] = await Promise.all([
        axios.get(`${API_BASE}/ai-marketing/marketing-messages`),
        axios.get(`${API_BASE}/ai-marketing/sales-scripts`)
      ]);
      setMarketingMessages(messagesResponse.data);
      setSalesScripts(scriptsResponse.data);
    } catch (error) {
      console.error('Error fetching marketing content:', error);
    }
  };

  const handleRunAICampaign = async () => {
    setIsRunningCampaign(true);
    setCampaignResults(null);
    
    try {
      const response = await axios.post(`${API_BASE}/ai-marketing/run-campaign`);
      setCampaignResults(response.data);
      toast.success('🚀 AI Marketing-Kampagne erfolgreich gestartet!');
      
      // Refresh data
      await fetchAIStatus();
      await fetchLeads();
    } catch (error) {
      console.error('Error running AI campaign:', error);
      toast.error('Fehler beim Starten der AI-Kampagne');
    } finally {
      setIsRunningCampaign(false);
    }
  };

  const handleRunSuperSeller = async () => {
    setIsRunningSeller(true);
    setSellerResults(null);
    
    try {
      const response = await axios.post(`${API_BASE}/ai-marketing/run-super-seller`);
      setSellerResults(response.data);
      toast.success('💎 Super-Seller Engine erfolgreich gestartet!');
      
      // Refresh data
      await fetchAIStatus();
      await fetchLeads();
    } catch (error) {
      console.error('Error running super-seller:', error);
      toast.error('Fehler beim Starten des Super-Sellers');
    } finally {
      setIsRunningSeller(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'interested': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'qualified': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'converted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'contacted': return 'Kontaktiert';
      case 'interested': return 'Interessiert';
      case 'qualified': return 'Qualifiziert';
      case 'converted': return 'Konvertiert';
      default: return 'Unbekannt';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 backdrop-blur-sm border-b border-purple-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/control')}
                className="text-purple-200 hover:bg-purple-400/10 border border-purple-400/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className="h-10 w-10 text-purple-400" />
                  <Gem className="h-4 w-4 text-pink-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-200 font-serif">AI Marketing & Super-Seller</h1>
                  <p className="text-purple-400/80 font-serif italic">Vollautomatisches Spitzen-Marketing</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Brain className="w-4 h-4 mr-2" />
                KI-Powered
              </Badge>
              <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                <Crown className="w-4 h-4 mr-2" />
                Elite
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Status Overview */}
        {aiStatus && (
          <Card className="bg-black/40 border-purple-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                AI Marketing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 font-serif">{aiStatus.total_leads}</div>
                  <div className="text-sm text-gray-400">Gesamt Leads</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 font-serif">{aiStatus.conversion_rate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 font-serif">{aiStatus.average_interest_level.toFixed(1)}/10</div>
                  <div className="text-sm text-gray-400">Interest Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 font-serif">{aiStatus.campaigns_active}</div>
                  <div className="text-sm text-gray-400">Active Campaigns</div>
                </div>
              </div>

              {/* Lead Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(aiStatus.lead_breakdown).map(([status, count]) => (
                  <div key={status} className="text-center p-3 bg-black/40 rounded-lg">
                    <Badge className={getStatusColor(status) + " mb-2"}>
                      {getStatusText(status)}
                    </Badge>
                    <div className="text-xl font-bold text-white">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Marketing Campaign */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-purple-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                AI Marketing Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 font-serif mb-2">🚀</div>
                <h3 className="text-xl font-semibold text-purple-200 mb-2">Spitzen-Marketing AI</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Vollautomatisches Marketing mit KI-generierten Nachrichten, 
                  perfektem Timing und intelligenter Lead-Nurturing.
                </p>
                
                <Button 
                  onClick={handleRunAICampaign}
                  disabled={isRunningCampaign}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-serif font-semibold h-12"
                >
                  {isRunningCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI Marketing läuft...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      AI Marketing Starten
                    </>
                  )}
                </Button>
              </div>

              {campaignResults && (
                <div className="p-4 bg-black/40 rounded-lg border border-purple-400/20">
                  <h4 className="font-semibold text-purple-200 mb-3">Kampagnen-Ergebnisse:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nachrichten gesendet:</span>
                      <span className="font-bold text-purple-400 ml-2">{campaignResults.messages_sent}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Antworten generiert:</span>
                      <span className="font-bold text-pink-400 ml-2">{campaignResults.responses_generated}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Qualifizierte Leads:</span>
                      <span className="font-bold text-yellow-400 ml-2">{campaignResults.qualified_leads}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Verkäufe erzielt:</span>
                      <span className="font-bold text-green-400 ml-2">{campaignResults.sales_made}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-gray-400">Umsatz generiert:</span>
                    <span className="font-bold text-green-400 ml-2 text-lg">€{campaignResults.revenue_generated.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Super-Seller Engine */}
          <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/30 border-yellow-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-serif flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Super-Seller Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 font-serif mb-2">💎</div>
                <h3 className="text-xl font-semibold text-yellow-200 mb-2">Elite Verkäufer AI</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Automatisierte Verkaufsgespräche mit KI-generierten Scripts, 
                  Einwandbehandlung und professionellen Abschlüssen.
                </p>
                
                <Button 
                  onClick={handleRunSuperSeller}
                  disabled={isRunningSeller}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-serif font-semibold h-12"
                >
                  {isRunningSeller ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Super-Seller läuft...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Super-Seller Starten
                    </>
                  )}
                </Button>
              </div>

              {sellerResults && (
                <div className="p-4 bg-black/40 rounded-lg border border-yellow-400/20">
                  <h4 className="font-semibold text-yellow-200 mb-3">Verkaufs-Ergebnisse:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Verkaufsgespräche:</span>
                      <span className="font-bold text-yellow-400 ml-2">{sellerResults.sales_calls_made}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Einwände behandelt:</span>
                      <span className="font-bold text-orange-400 ml-2">{sellerResults.objections_handled}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Abschluss-Versuche:</span>
                      <span className="font-bold text-purple-400 ml-2">{sellerResults.closes_attempted}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Erfolgreiche Verkäufe:</span>
                      <span className="font-bold text-green-400 ml-2">{sellerResults.sales_closed}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-gray-400">Umsatz erzielt:</span>
                    <span className="font-bold text-green-400 ml-2 text-lg">€{sellerResults.revenue_generated.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Combined Action */}
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 border-green-400/30 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-green-200 font-serif flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-400" />
              Vollautomatisches Spitzen-Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-green-400 font-serif mb-4">⚡</div>
              <h3 className="text-2xl font-semibold text-green-200 mb-4">Komplett-Automatisierung</h3>
              <p className="text-gray-400 mb-6">
                Startet AI Marketing + Super-Seller gleichzeitig für maximale Effizienz
              </p>
              
              <Button 
                onClick={async () => {
                  await handleRunAICampaign();
                  await handleRunSuperSeller();
                }}
                disabled={isRunningCampaign || isRunningSeller}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-serif font-semibold px-8 py-4 text-lg"
              >
                {(isRunningCampaign || isRunningSeller) ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Vollautomatisierung läuft...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-5 w-5" />
                    Vollautomatisierung Starten
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lead Overview */}
        <Card className="bg-black/40 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-serif flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Lead Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.slice(0, 10).map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-sm text-gray-400">{lead.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusText(lead.status)}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      Interest: {lead.interest_level}/10
                    </div>
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
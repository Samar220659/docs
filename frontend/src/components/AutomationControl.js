import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft, 
  Bot, 
  Zap, 
  MessageCircle, 
  Share2, 
  DollarSign,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

export default function AutomationControl() {
  const navigate = useNavigate();
  
  // States
  const [config, setConfig] = useState({
    whatsapp_api_key: '',
    facebook_access_token: '',
    linkedin_access_token: '',
    twitter_api_key: '',
    paypal_client_id: '',
    paypal_client_secret: '',
    auto_marketing_enabled: false,
    daily_message_limit: 50,
    auto_response_enabled: false
  });
  
  const [automationStatus, setAutomationStatus] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isRunningCampaign, setIsRunningCampaign] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [messageType, setMessageType] = useState('whatsapp');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  useEffect(() => {
    fetchAutomationStatus();
  }, []);

  const fetchAutomationStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/automation/status`);
      setAutomationStatus(response.data);
    } catch (error) {
      console.error('Error fetching automation status:', error);
    }
  };

  const handleConfigureAutomation = async () => {
    setIsConfiguring(true);
    try {
      await axios.post(`${API_BASE}/automation/configure`, config);
      toast.success('Automation erfolgreich konfiguriert!');
      await fetchAutomationStatus();
    } catch (error) {
      console.error('Error configuring automation:', error);
      toast.error('Fehler bei der Konfiguration');
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleRunCampaign = async () => {
    setIsRunningCampaign(true);
    try {
      const response = await axios.post(`${API_BASE}/automation/run-campaign`);
      toast.success('Marketing-Kampagne gestartet!');
      await fetchAutomationStatus();
    } catch (error) {
      console.error('Error running campaign:', error);
      toast.error('Fehler beim Starten der Kampagne');
    } finally {
      setIsRunningCampaign(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!customMessage || !customRecipient) {
      toast.error('Bitte Message und Empfänger eingeben');
      return;
    }

    try {
      await axios.post(`${API_BASE}/automation/send-message`, {
        type: messageType,
        recipient: customRecipient,
        message: customMessage
      });
      toast.success('Nachricht erfolgreich gesendet!');
      setCustomMessage('');
      setCustomRecipient('');
      await fetchAutomationStatus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentAmount || !paymentDescription) {
      toast.error('Bitte Betrag und Beschreibung eingeben');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/automation/paypal-payment`, {
        amount: parseFloat(paymentAmount),
        description: paymentDescription
      });
      
      if (response.data.status === 'created') {
        toast.success('PayPal-Zahlung erstellt!');
        window.open(response.data.approval_url, '_blank');
      }
      
      setPaymentAmount('');
      setPaymentDescription('');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Fehler beim Erstellen der Zahlung');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await axios.post(`${API_BASE}/automation/emergency-stop`);
      toast.success('Automation gestoppt!');
      await fetchAutomationStatus();
    } catch (error) {
      console.error('Error stopping automation:', error);
      toast.error('Fehler beim Stoppen');
    }
  };

  const getApiStatusColor = (isActive) => {
    return isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 via-yellow-900/20 to-amber-900/30 backdrop-blur-sm border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/control')}
                className="text-yellow-200 hover:bg-yellow-400/10 border border-yellow-400/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8 text-yellow-400" />
                <div>
                  <h1 className="text-2xl font-bold text-yellow-200 font-serif">Automation Command Center</h1>
                  <p className="text-yellow-400/80 font-serif italic">Digitaler Zwilling • Vollautomatisierung</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={automationStatus?.campaign_running ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                {automationStatus?.campaign_running ? 'Aktiv' : 'Inaktiv'}
              </Badge>
              <Button 
                onClick={handleEmergencyStop}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* API Configuration */}
        <Card className="bg-black/40 border-yellow-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-serif flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-400" />
              API Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-yellow-200 font-serif">WhatsApp Business API Key</Label>
                <Input
                  type="password"
                  value={config.whatsapp_api_key}
                  onChange={(e) => setConfig({...config, whatsapp_api_key: e.target.value})}
                  className="bg-black/40 border-yellow-400/20 text-white"
                  placeholder="Ihr WhatsApp API Key"
                />
              </div>
              <div>
                <Label className="text-yellow-200 font-serif">Facebook Access Token</Label>
                <Input
                  type="password"
                  value={config.facebook_access_token}
                  onChange={(e) => setConfig({...config, facebook_access_token: e.target.value})}
                  className="bg-black/40 border-yellow-400/20 text-white"
                  placeholder="Ihr Facebook Token"
                />
              </div>
              <div>
                <Label className="text-yellow-200 font-serif">LinkedIn Access Token</Label>
                <Input
                  type="password"
                  value={config.linkedin_access_token}
                  onChange={(e) => setConfig({...config, linkedin_access_token: e.target.value})}
                  className="bg-black/40 border-yellow-400/20 text-white"
                  placeholder="Ihr LinkedIn Token"
                />
              </div>
              <div>
                <Label className="text-yellow-200 font-serif">Daily Message Limit</Label>
                <Input
                  type="number"
                  value={config.daily_message_limit}
                  onChange={(e) => setConfig({...config, daily_message_limit: parseInt(e.target.value)})}
                  className="bg-black/40 border-yellow-400/20 text-white"
                  placeholder="50"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Switch
                checked={config.auto_marketing_enabled}
                onCheckedChange={(checked) => setConfig({...config, auto_marketing_enabled: checked})}
                className="data-[state=checked]:bg-yellow-400"
              />
              <Label className="text-yellow-200 font-serif">Auto-Marketing aktivieren</Label>
            </div>

            <Button 
              onClick={handleConfigureAutomation}
              disabled={isConfiguring}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-serif font-semibold"
            >
              {isConfiguring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Konfiguriere...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Automation Konfigurieren
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        {automationStatus && (
          <Card className="bg-black/40 border-blue-400/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-blue-200 font-serif flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(automationStatus.active_apis).map(([api, isActive]) => (
                  <div key={api} className="p-4 bg-black/40 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-serif capitalize">{api}</span>
                      <Badge className={getApiStatusColor(isActive)}>
                        {isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 font-serif">{automationStatus.messages_sent_today}</div>
                  <div className="text-sm text-gray-400">Nachrichten heute</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 font-serif">{automationStatus.daily_limit}</div>
                  <div className="text-sm text-gray-400">Tägliches Limit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 font-serif">
                    {automationStatus.campaign_running ? 'Läuft' : 'Gestoppt'}
                  </div>
                  <div className="text-sm text-gray-400">Kampagne Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Marketing Campaign */}
          <Card className="bg-black/40 border-green-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-200 font-serif flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-400" />
                Marketing Kampagne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-black/40 rounded-lg border border-green-400/10">
                <h3 className="font-semibold text-green-200 mb-2">Automatische Kampagne</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Startet automatisierte Nachrichten auf WhatsApp, Facebook und LinkedIn
                </p>
                <Button 
                  onClick={handleRunCampaign}
                  disabled={isRunningCampaign}
                  className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-serif font-semibold"
                >
                  {isRunningCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kampagne läuft...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Kampagne Starten
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-green-400/10">
                <h3 className="font-semibold text-green-200 mb-2">Einzelnachricht</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-green-200 font-serif">Plattform</Label>
                    <select 
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-green-400/20 rounded text-white"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-green-200 font-serif">Empfänger</Label>
                    <Input
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      className="bg-black/40 border-green-400/20 text-white"
                      placeholder="+49123456789 oder Email"
                    />
                  </div>
                  <div>
                    <Label className="text-green-200 font-serif">Nachricht</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="bg-black/40 border-green-400/20 text-white"
                      placeholder="Ihre Nachricht..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSendCustomMessage}
                    className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-serif font-semibold"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Nachricht Senden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PayPal Automation */}
          <Card className="bg-black/40 border-purple-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                PayPal Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-black/40 rounded-lg border border-purple-400/10">
                <h3 className="font-semibold text-purple-200 mb-2">Automatische Zahlung</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-purple-200 font-serif">Betrag (EUR)</Label>
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="bg-black/40 border-purple-400/20 text-white"
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200 font-serif">Beschreibung</Label>
                    <Input
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      className="bg-black/40 border-purple-400/20 text-white"
                      placeholder="Business-Beratung"
                    />
                  </div>
                  <Button 
                    onClick={handleCreatePayment}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-serif font-semibold"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    PayPal-Link Erstellen
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-purple-400/10">
                <h3 className="font-semibold text-purple-200 mb-2">Automation Features</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Automatische Rechnungserstellung</li>
                  <li>• Zahlungs-Erinnerungen</li>
                  <li>• Umsatz-Tracking</li>
                  <li>• Kunden-Management</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
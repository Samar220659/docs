import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from '../hooks/use-toast';
import { api } from '../services/api';

const AutonomousHub = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [optimizationMetrics, setOptimizationMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  // Lead Processing State
  const [leadForm, setLeadForm] = useState({
    email: '',
    name: '',
    company: '',
    phone: '',
    source: 'website',
    interests: [],
    budget_range: '',
    urgency: 'normal',
    notes: ''
  });

  // Sales Chat State
  const [chatForm, setChatForm] = useState({
    conversation_id: '',
    customer_message: '',
    customer_email: ''
  });

  // Transaction State
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    service_type: 'digital_marketing',
    customer_email: '',
    customer_name: '',
    payment_method: 'paypal',
    additional_info: {}
  });

  const [activeSalesChats, setActiveSalesChats] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadSystemStatus();
    loadBusinessMetrics();
    loadOptimizationMetrics();
    
    // Real-time Updates alle 30 Sekunden
    const interval = setInterval(() => {
      loadSystemStatus();
      loadBusinessMetrics();
      loadOptimizationMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadOptimizationMetrics = async () => {
    try {
      const response = await api.get('/optimization/performance-metrics');
      setOptimizationMetrics(response.data.performance_metrics);
    } catch (error) {
      console.error('Optimization Metrics Fehler:', error);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const response = await api.get('/autonomous/system-status');
      setSystemStatus(response.data.autonomous_system);
    } catch (error) {
      console.error('System Status Fehler:', error);
    }
  };

  const loadBusinessMetrics = async () => {
    try {
      const response = await api.get('/autonomous/business-metrics');
      setBusinessMetrics(response.data.autonomous_metrics);
    } catch (error) {
      console.error('Business Metrics Fehler:', error);
    }
  };

  const processLead = async () => {
    if (!leadForm.email || !leadForm.name) {
      toast({
        title: "❌ Eingabefehler",
        description: "E-Mail und Name sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/autonomous/process-lead', leadForm);
      
      toast({
        title: "🤖 Lead vollautomatisch verarbeitet!",
        description: `AI-Angebot erstellt - Conversion: ${response.data.estimated_conversion}%`,
        variant: "default"
      });

      // Real-time Update hinzufügen
      addRealTimeUpdate({
        type: 'lead_processed',
        message: `Lead ${leadForm.email} verarbeitet - Angebot gesendet`,
        timestamp: new Date(),
        conversion_probability: response.data.estimated_conversion
      });

      // Form zurücksetzen
      setLeadForm({
        email: '',
        name: '',
        company: '',
        phone: '',
        source: 'website',
        interests: [],
        budget_range: '',
        urgency: 'normal',
        notes: ''
      });

      loadBusinessMetrics();

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Lead-Verarbeitung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSalesMessage = async () => {
    if (!chatForm.conversation_id || !chatForm.customer_message) {
      toast({
        title: "❌ Eingabefehler",
        description: "Conversation ID und Nachricht sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/autonomous/sales-chat', chatForm);
      
      // Chat zur aktiven Liste hinzufügen
      const newChat = {
        conversation_id: chatForm.conversation_id,
        customer_message: chatForm.customer_message,
        ai_response: response.data.ai_response,
        sales_stage: response.data.sales_stage,
        suggested_action: response.data.suggested_action,
        timestamp: new Date()
      };

      setActiveSalesChats([newChat, ...activeSalesChats.slice(0, 4)]);

      toast({
        title: "💬 AI-Sales-Response",
        description: `Stage: ${response.data.sales_stage} - Action: ${response.data.suggested_action}`,
        variant: "default"
      });

      // Real-time Update
      addRealTimeUpdate({
        type: 'sales_chat',
        message: `AI-Verkauf: ${response.data.sales_stage}`,
        timestamp: new Date(),
        action: response.data.suggested_action
      });

      setChatForm({
        conversation_id: '',
        customer_message: '',
        customer_email: ''
      });

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Sales-Chat fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.customer_email || !transactionForm.customer_name) {
      toast({
        title: "❌ Eingabefehler",
        description: "Alle Transaktionsfelder sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/autonomous/complete-transaction', {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount)
      });
      
      // Transaktion zur Liste hinzufügen
      const newTransaction = {
        transaction_id: response.data.transaction_id,
        invoice_id: response.data.invoice_id,
        customer_email: transactionForm.customer_email,
        amount: response.data.gross_amount,
        service: transactionForm.service_type,
        timestamp: new Date()
      };

      setRecentTransactions([newTransaction, ...recentTransactions.slice(0, 4)]);

      toast({
        title: "💰 Transaktion vollautomatisch verarbeitet!",
        description: `Rechnung ${response.data.invoice_id} erstellt - €${response.data.gross_amount}`,
        variant: "default"
      });

      // Real-time Update
      addRealTimeUpdate({
        type: 'transaction',
        message: `💰 €${response.data.gross_amount} - ${transactionForm.service_type}`,
        timestamp: new Date(),
        invoice_id: response.data.invoice_id
      });

      setTransactionForm({
        amount: '',
        service_type: 'digital_marketing',
        customer_email: '',
        customer_name: '',
        payment_method: 'paypal',
        additional_info: {}
      });

      loadBusinessMetrics();

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Transaktionsverarbeitung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addRealTimeUpdate = (update) => {
    setRealTimeUpdates(prev => [update, ...prev.slice(0, 9)]);
  };

  const addInterest = (interest) => {
    if (!leadForm.interests.includes(interest)) {
      setLeadForm({
        ...leadForm,
        interests: [...leadForm.interests, interest]
      });
    }
  };

  const removeInterest = (interest) => {
    setLeadForm({
      ...leadForm,
      interests: leadForm.interests.filter(i => i !== interest)
    });
  };

  const runOptimization = async (optimizationType) => {
    try {
      setLoading(true);
      const response = await api.post('/optimization/run-optimization', {
        optimization_type: optimizationType
      });
      
      toast({
        title: "🚀 Self-Optimization gestartet!",
        description: `${optimizationType} wird ausgeführt - Ergebnisse in Kürze verfügbar`,
        variant: "default"
      });

      // Real-time Update hinzufügen
      addRealTimeUpdate({
        type: 'optimization',
        message: `🚀 Self-Optimization: ${optimizationType} gestartet`,
        timestamp: new Date(),
        optimization_type: optimizationType
      });

      // Metrics nach kurzer Verzögerung neu laden
      setTimeout(() => {
        loadOptimizationMetrics();
        loadBusinessMetrics();
      }, 2000);

    } catch (error) {
      toast({
        title: "❌ Optimization Fehler",
        description: error.response?.data?.detail || "Self-Optimization fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !systemStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-300 text-lg">🤖 Autonomes System wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent mb-2">
            🤖 ZZ-Lobby Autonomous Business Engine
          </h1>
          <p className="text-slate-300 text-lg">
            92% Autonome Geldmaschine mit KI-Verkauf & Rechtskonformität
          </p>
          {systemStatus && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Badge variant={systemStatus.ai_engine === 'active' ? 'default' : 'secondary'} className="bg-green-900 text-green-200">
                AI-Engine: {systemStatus.ai_engine}
              </Badge>
              <Badge variant="default" className="bg-blue-900 text-blue-200">
                Autonomie: {systemStatus.autonomy_level}
              </Badge>
              <Badge variant="default" className="bg-purple-900 text-purple-200">
                Legal: {systemStatus.legal_compliance}
              </Badge>
            </div>
          )}
        </div>

        {/* Real-time Performance Dashboard */}
        {businessMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  €{businessMetrics.current_month_revenue?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-slate-400">💰 Monats-Umsatz</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {businessMetrics.current_month_transactions || 0}
                </div>
                <div className="text-sm text-slate-400">🎯 Transaktionen</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {businessMetrics.ai_conversion_rate?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-sm text-slate-400">🤖 AI-Conversion</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  €{businessMetrics.average_deal_size?.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-slate-400">📈 Ø Deal-Size</div>
              </CardContent>
            </Card>
            {optimizationMetrics && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    +{optimizationMetrics.revenue_growth?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-sm text-slate-400">🚀 Revenue Growth</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Real-time Activity Feed */}
        {realTimeUpdates.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                📡 Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {realTimeUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        update.type === 'transaction' ? 'bg-green-400' :
                        update.type === 'lead_processed' ? 'bg-blue-400' :
                        'bg-purple-400'
                      }`}></div>
                      <span className="text-slate-200 text-sm">{update.message}</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {update.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="lead-processing" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="lead-processing" className="text-green-300 data-[state=active]:bg-green-900">
              🎯 AI-Lead-Processing
            </TabsTrigger>
            <TabsTrigger value="sales-engine" className="text-blue-300 data-[state=active]:bg-blue-900">
              💬 Sales-Engine
            </TabsTrigger>
            <TabsTrigger value="transaction-engine" className="text-purple-300 data-[state=active]:bg-purple-900">
              💰 Transaction-Engine  
            </TabsTrigger>
            <TabsTrigger value="optimization" className="text-emerald-300 data-[state=active]:bg-emerald-900">
              🚀 Self-Optimization
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-yellow-300 data-[state=active]:bg-yellow-900">
              📊 Monitoring
            </TabsTrigger>
          </TabsList>

          {/* AI Lead Processing Tab */}
          <TabsContent value="lead-processing" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  🎯 Vollautomatische Lead-Verarbeitung
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  AI analysiert Lead → erstellt Angebot → sendet E-Mail → verfolgt Conversion
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="E-Mail Adresse*"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Input
                    placeholder="Name*"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Input
                    placeholder="Unternehmen"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Input
                    placeholder="Telefon"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={leadForm.source} onValueChange={(value) => setLeadForm({...leadForm, source: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">🌐 Website</SelectItem>
                      <SelectItem value="social_media">📱 Social Media</SelectItem>
                      <SelectItem value="referral">👥 Empfehlung</SelectItem>
                      <SelectItem value="advertising">📢 Werbung</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={leadForm.urgency} onValueChange={(value) => setLeadForm({...leadForm, urgency: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Niedrig</SelectItem>
                      <SelectItem value="normal">🟡 Normal</SelectItem>
                      <SelectItem value="high">🟠 Hoch</SelectItem>
                      <SelectItem value="urgent">🔴 Dringend</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Budget-Range (z.B. 500-2000€)"
                    value={leadForm.budget_range}
                    onChange={(e) => setLeadForm({...leadForm, budget_range: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Interessen (AI analysiert automatisch)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {[
                      'Digital Marketing',
                      'Business Automation', 
                      'Website Development',
                      'Social Media',
                      'E-Commerce',
                      'Lead Generation',
                      'SEO/SEM',
                      'Consulting'
                    ].map(interest => (
                      <Button
                        key={interest}
                        variant={leadForm.interests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        onClick={() => leadForm.interests.includes(interest) 
                          ? removeInterest(interest) 
                          : addInterest(interest)
                        }
                        className="text-xs"
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {leadForm.interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="bg-green-900 text-green-200">
                        {interest}
                        <button 
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-green-400 hover:text-green-200"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="Zusätzliche Notizen (AI verwendet diese für Angebotserstellung)..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({...leadForm, notes: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                  rows={3}
                />

                <Button 
                  onClick={processLead}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? '⏳ AI verarbeitet Lead...' : '🤖 Lead vollautomatisch verarbeiten'}
                </Button>

                <Card className="bg-green-900/20 border-green-800">
                  <CardContent className="p-4">
                    <h4 className="text-green-300 font-semibold mb-2">🤖 Was passiert automatisch:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• ✅ DSGVO-Compliance-Prüfung</li>
                      <li>• 🧠 AI analysiert Lead-Potenzial</li>
                      <li>• 📋 Passendes Angebot wird erstellt</li>
                      <li>• ⚖️ Rechtskonforme Vertragsvorlage</li>
                      <li>• 📊 Steuerliche Vorbereitung</li>
                      <li>• 📧 Professionelle E-Mail mit Angebot</li>
                      <li>• 📈 Conversion-Tracking startet</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Engine Tab */}
          <TabsContent value="sales-engine" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  💬 AI-Sales-Engine - Autonome Verkaufsgespräche
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Conversation ID (z.B. lead-12345)"
                    value={chatForm.conversation_id}
                    onChange={(e) => setChatForm({...chatForm, conversation_id: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Input
                    placeholder="Kunden E-Mail (optional)"
                    value={chatForm.customer_email}
                    onChange={(e) => setChatForm({...chatForm, customer_email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <Textarea
                  placeholder="Kundennachricht (AI wird automatisch rechtskonform antworten)..."
                  value={chatForm.customer_message}
                  onChange={(e) => setChatForm({...chatForm, customer_message: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                  rows={4}
                />

                <Button 
                  onClick={sendSalesMessage}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? '⏳ AI antwortet...' : '💬 AI-Sales-Response generieren'}
                </Button>

                {/* Active Sales Chats */}
                {activeSalesChats.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-blue-300 font-semibold">🔥 Aktive AI-Verkaufsgespräche:</h4>
                    {activeSalesChats.map((chat, index) => (
                      <Card key={index} className="bg-blue-900/20 border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-blue-300 border-blue-600">
                              {chat.conversation_id}
                            </Badge>
                            <Badge variant={
                              chat.sales_stage === 'closed' ? 'default' :
                              chat.sales_stage === 'decision' ? 'secondary' : 'outline'
                            }>
                              {chat.sales_stage}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-300 mb-2">
                            <strong>Kunde:</strong> {chat.customer_message.substring(0, 100)}...
                          </div>
                          <div className="text-sm text-blue-200 mb-2">
                            <strong>AI-Response:</strong> {chat.ai_response.substring(0, 150)}...
                          </div>
                          <div className="text-xs text-slate-400">
                            Nächste Aktion: {chat.suggested_action} • {chat.timestamp.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardContent className="p-4">
                    <h4 className="text-blue-300 font-semibold mb-2">🧠 AI-Sales-Features:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 🎯 Automatische Lead-Qualifizierung</li>
                      <li>• 💬 Personalisierte Verkaufsargumente</li>
                      <li>• ⚖️ Rechtskonform (Widerrufsrecht, DSGVO)</li>
                      <li>• 📊 Sales-Stage-Tracking</li>
                      <li>• 🚀 Automatische Angebotserstellung</li>
                      <li>• 📧 Follow-up-Sequenzen</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction Engine Tab */}
          <TabsContent value="transaction-engine" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  💰 Transaction-Engine - Vollautomatische Abwicklung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Betrag (Netto in €)"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Select 
                    value={transactionForm.service_type} 
                    onValueChange={(value) => setTransactionForm({...transactionForm, service_type: value})}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital_marketing">🎯 Digital Marketing</SelectItem>
                      <SelectItem value="automation_setup">🤖 Automation Setup</SelectItem>
                      <SelectItem value="consulting">💼 Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Kunden E-Mail"
                    value={transactionForm.customer_email}
                    onChange={(e) => setTransactionForm({...transactionForm, customer_email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                  <Input
                    placeholder="Kundenname"
                    value={transactionForm.customer_name}
                    onChange={(e) => setTransactionForm({...transactionForm, customer_name: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <Select 
                  value={transactionForm.payment_method} 
                  onValueChange={(value) => setTransactionForm({...transactionForm, payment_method: value})}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">💳 PayPal</SelectItem>
                    <SelectItem value="bank_transfer">🏦 Überweisung</SelectItem>
                    <SelectItem value="stripe">💰 Stripe</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  onClick={completeTransaction}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? '⏳ Verarbeitet...' : '💰 Transaktion vollautomatisch verarbeiten'}
                </Button>

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-purple-300 font-semibold">💰 Neueste Transaktionen:</h4>
                    {recentTransactions.map((transaction, index) => (
                      <Card key={index} className="bg-purple-900/20 border-purple-800">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-slate-200 font-medium">€{transaction.amount.toFixed(2)}</div>
                              <div className="text-sm text-slate-400">{transaction.customer_email}</div>
                              <div className="text-sm text-purple-300">{transaction.service.replace('_', ' ').toUpperCase()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-400">{transaction.invoice_id}</div>
                              <div className="text-xs text-slate-500">{transaction.timestamp.toLocaleString()}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="bg-purple-900/20 border-purple-800">
                  <CardContent className="p-4">
                    <h4 className="text-purple-300 font-semibold mb-2">⚡ Automatische Verarbeitung:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• 📊 Steuerberechnung (19% USt-ID: DE4535548228)</li>
                      <li>• 📋 Rechnung automatisch erstellen</li>
                      <li>• 📧 Bestätigungs-E-Mail an Kunde</li>
                      <li>• 💾 GoBD-konforme Archivierung</li>
                      <li>• 📈 Performance-Tracking Update</li>
                      <li>• 🎯 Elster-Vorbereitung</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Status */}
              {systemStatus && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-300">🔧 System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">AI Engine:</span>
                      <Badge variant={systemStatus.ai_engine === 'active' ? 'default' : 'secondary'}>
                        {systemStatus.ai_engine}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Legal Compliance:</span>
                      <Badge variant="default" className="bg-green-900 text-green-200">
                        {systemStatus.legal_compliance}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Tax Automation:</span>
                      <Badge variant="default" className="bg-blue-900 text-blue-200">
                        {systemStatus.tax_automation}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Autonomy Level:</span>
                      <Badge variant="default" className="bg-purple-900 text-purple-200">
                        {systemStatus.autonomy_level}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="text-slate-300 text-sm mb-2">Overall Performance:</div>
                      <Progress value={92} className="w-full" />
                      <div className="text-right text-xs text-slate-400 mt-1">92% Autonomous</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Business Metrics */}
              {businessMetrics && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-yellow-300">📈 Business Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Total Leads:</span>
                      <span className="text-yellow-400 font-bold">{businessMetrics.total_leads_processed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">AI Offers:</span>
                      <span className="text-blue-400 font-bold">{businessMetrics.total_offers_generated}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Conversion Rate:</span>
                      <span className="text-green-400 font-bold">{businessMetrics.ai_conversion_rate?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Avg Deal Size:</span>
                      <span className="text-purple-400 font-bold">€{businessMetrics.average_deal_size?.toFixed(0)}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-slate-300 text-sm mb-2">AI Performance:</div>
                      <Progress value={businessMetrics.ai_conversion_rate || 0} className="w-full" />
                      <div className="text-right text-xs text-slate-400 mt-1">
                        {businessMetrics.ai_conversion_rate?.toFixed(1)}% Conversion Rate
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Autonomous Features Overview */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-300">🚀 Autonome Features - Was läuft automatisch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-green-300 font-semibold">🎯 Lead Processing</h4>
                    <ul className="text-sm text-slate-300 space-y-0.5">
                      <li>• DSGVO Auto-Check</li>
                      <li>• AI Lead-Scoring</li>
                      <li>• Angebots-Generierung</li>
                      <li>• E-Mail Versand</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-blue-300 font-semibold">💬 Sales Engine</h4>
                    <ul className="text-sm text-slate-300 space-y-0.5">
                      <li>• AI-Verkaufsgespräche</li>
                      <li>• Rechtskonformität</li>
                      <li>• Follow-up Sequenzen</li>
                      <li>• Conversion-Tracking</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-purple-300 font-semibold">💰 Transaction</h4>
                    <ul className="text-sm text-slate-300 space-y-0.5">
                      <li>• Steuer-Berechnung</li>
                      <li>• Rechnung-Erstellung</li>
                      <li>• Kunden-Benachrichtigung</li>
                      <li>• Elster-Vorbereitung</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Self-Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  🚀 Self-Optimizing Revenue Machine - 95% Autonomie
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  System optimiert sich selbst - A/B-Tests, Budget-Allocation, Viral Content, Nischen-Expansion
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => runOptimization('full-cycle')}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">🔄</div>
                    <div className="font-semibold">Full Optimization Cycle</div>
                    <div className="text-xs opacity-80">Komplette Selbstoptimierung</div>
                  </Button>
                  
                  <Button 
                    onClick={() => runOptimization('ab-tests')}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">🧪</div>
                    <div className="font-semibold">A/B-Tests starten</div>
                    <div className="text-xs opacity-80">Automatische Kampagnen-Tests</div>
                  </Button>
                  
                  <Button 
                    onClick={() => runOptimization('budget-allocation')}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <div className="font-semibold">Budget optimieren</div>
                    <div className="text-xs opacity-80">Performance-basierte Verteilung</div>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => runOptimization('viral-content')}
                    disabled={loading}
                    className="bg-pink-600 hover:bg-pink-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="font-semibold">Viral Content</div>
                    <div className="text-xs opacity-80">Content für maximale Reichweite</div>
                  </Button>
                  
                  <Button 
                    onClick={() => runOptimization('niche-expansion')}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold">Nischen-Expansion</div>
                    <div className="text-xs opacity-80">Neue profitable Märkte finden</div>
                  </Button>
                  
                  <Button 
                    onClick={() => runOptimization('competitive-analysis')}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white p-6 h-auto flex flex-col"
                  >
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="font-semibold">Konkurrenz-Analyse</div>
                    <div className="text-xs opacity-80">Marktlücken automatisch finden</div>
                  </Button>
                </div>

                {/* Optimization Metrics */}
                {optimizationMetrics && (
                  <Card className="bg-emerald-900/20 border-emerald-800">
                    <CardHeader>
                      <CardTitle className="text-emerald-300">📈 Self-Optimization Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400">
                            +{optimizationMetrics.revenue_growth?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-400">Revenue Growth</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">
                            +{optimizationMetrics.conversion_rate_improvement?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-400">Conversion Improvement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">
                            -{optimizationMetrics.cost_per_acquisition_reduction?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-400">Cost Reduction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">
                            +{optimizationMetrics.customer_lifetime_value_increase?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-400">LTV Increase</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-400">
                            +{optimizationMetrics.market_share_growth?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-400">Market Share</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-400">
                            {optimizationMetrics.efficiency_score?.toFixed(1)}/100
                          </div>
                          <div className="text-sm text-slate-400">Efficiency Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-emerald-900/20 border-emerald-800">
                  <CardContent className="p-4">
                    <h4 className="text-emerald-300 font-semibold mb-2">🤖 Was läuft vollautomatisch:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• 🧪 A/B-Tests aller E-Mail-Subjects</li>
                        <li>• 💰 Performance-basierte Budget-Verteilung</li>
                        <li>• 🚀 Viral-Content-Optimierung</li>
                        <li>• 🎯 Multi-Nischen-Expansion</li>
                      </ul>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• 🔍 Automatische Konkurrenz-Analyse</li>
                        <li>• 💡 Marktchancen-Erkennung</li>
                        <li>• 📊 Real-time Performance-Tracking</li>
                        <li>• 🔄 24/7 Selbstoptimierung</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutonomousHub;
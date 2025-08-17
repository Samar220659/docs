import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '../hooks/use-toast';
import api from '../services/api';

const DigitalManager = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Insurance Request State
  const [insuranceForm, setInsuranceForm] = useState({
    request_type: 'business',
    company_name: 'ZZ-Lobby',
    business_type: 'Digitale Business-Automatisierung und Online-Marketing',
    coverage_needed: [],
    annual_revenue: '',
    employees: 1,
    priority: 'normal',
    notes: ''
  });

  // Tax Calculation State  
  const [taxDocuments, setTaxDocuments] = useState([]);
  const [newTaxDoc, setNewTaxDoc] = useState({
    document_type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    vat_rate: 0.19,
    is_deductible: true
  });

  // Legal Document State
  const [legalForm, setLegalForm] = useState({
    document_type: 'agb',
    company_name: 'ZZ-Lobby',
    business_address: '06712 Zeitz, Deutschland',
    contact_email: 'daniel@zz-lobby.de',
    vat_id: 'DE4535548228',
    business_type: 'Digitale Business-Automatisierung und Online-Marketing'
  });

  // Email State
  const [emailForm, setEmailForm] = useState({
    to_email: '',
    subject: '',
    content: ''
  });

  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [taxCalculation, setTaxCalculation] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/digital-manager/dashboard');
      setDashboardData(response.data.dashboard);
    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: "Dashboard konnte nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInsuranceRequest = async () => {
    try {
      setLoading(true);
      const response = await api.post('/digital-manager/insurance-request', insuranceForm);
      
      toast({
        title: "🛡️ Versicherungsanfrage gesendet!",
        description: `Anfrage erfolgreich an Thomas Kaiser (ERGO Gera) gesendet`,
        variant: "default"
      });

      loadDashboard();
      
      // Form zurücksetzen
      setInsuranceForm({
        ...insuranceForm,
        notes: '',
        coverage_needed: []
      });

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Versicherungsanfrage fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTaxDocument = () => {
    if (!newTaxDoc.amount || !newTaxDoc.description) {
      toast({
        title: "❌ Eingabefehler",
        description: "Betrag und Beschreibung sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    setTaxDocuments([...taxDocuments, {
      ...newTaxDoc,
      amount: parseFloat(newTaxDoc.amount),
      date: new Date(newTaxDoc.date)
    }]);

    setNewTaxDoc({
      document_type: 'expense',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      vat_rate: 0.19,
      is_deductible: true
    });
  };

  const calculateTaxes = async () => {
    if (taxDocuments.length === 0) {
      toast({
        title: "❌ Keine Dokumente",
        description: "Fügen Sie mindestens ein Dokument hinzu",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/digital-manager/tax-calculation', taxDocuments);
      setTaxCalculation(response.data);
      
      toast({
        title: "📊 Steuerberechnung erstellt!",
        description: `${taxDocuments.length} Dokumente analysiert`,
        variant: "default"
      });

      loadDashboard();

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Steuerberechnung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLegalDocument = async () => {
    try {
      setLoading(true);
      const response = await api.post('/digital-manager/legal-document', legalForm);
      setGeneratedDocument(response.data);
      
      toast({
        title: "⚖️ Rechtsdokument erstellt!",
        description: `${legalForm.document_type.toUpperCase()} wurde generiert`,
        variant: "default"
      });

      loadDashboard();

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "Dokumentgenerierung fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBusinessEmail = async () => {
    if (!emailForm.to_email || !emailForm.subject || !emailForm.content) {
      toast({
        title: "❌ Eingabefehler",
        description: "Alle E-Mail-Felder sind erforderlich",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/digital-manager/send-business-email', emailForm);
      
      toast({
        title: "📧 E-Mail versendet!",
        description: `E-Mail erfolgreich an ${emailForm.to_email} gesendet`,
        variant: "default"
      });

      setEmailForm({
        to_email: '',
        subject: '',
        content: ''
      });

    } catch (error) {
      toast({
        title: "❌ Fehler",
        description: error.response?.data?.detail || "E-Mail-Versand fehlgeschlagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCoverageType = (coverage) => {
    if (!insuranceForm.coverage_needed.includes(coverage)) {
      setInsuranceForm({
        ...insuranceForm,
        coverage_needed: [...insuranceForm.coverage_needed, coverage]
      });
    }
  };

  const removeCoverageType = (coverage) => {
    setInsuranceForm({
      ...insuranceForm,
      coverage_needed: insuranceForm.coverage_needed.filter(c => c !== coverage)
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-300 text-lg">🤖 Digital Manager wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">
            🤖 ZZ-Lobby Digital Manager
          </h1>
          <p className="text-slate-300 text-lg">
            Komplette Business-Automatisierung für Daniel Oettel
          </p>
        </div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {dashboardData.statistics.insurance_requests}
                </div>
                <div className="text-sm text-slate-400">🛡️ Versicherungsanfragen</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {dashboardData.statistics.tax_calculations}
                </div>
                <div className="text-sm text-slate-400">📊 Steuerberechnungen</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {dashboardData.statistics.legal_documents}
                </div>
                <div className="text-sm text-slate-400">⚖️ Rechtsdokumente</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {dashboardData.statistics.total_automations}
                </div>
                <div className="text-sm text-slate-400">🤖 Total Automationen</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="insurance" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="insurance" className="text-blue-300 data-[state=active]:bg-blue-900">
              🛡️ Versicherung
            </TabsTrigger>
            <TabsTrigger value="tax" className="text-green-300 data-[state=active]:bg-green-900">
              📊 Steuer-KI
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-purple-300 data-[state=active]:bg-purple-900">
              ⚖️ Recht
            </TabsTrigger>
            <TabsTrigger value="email" className="text-yellow-300 data-[state=active]:bg-yellow-900">
              📧 E-Mail
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-slate-300 data-[state=active]:bg-slate-700">
              📈 Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-300 flex items-center gap-2">
                  🛡️ Versicherungsberatung - Thomas Kaiser ERGO Gera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Anfrage-Typ
                    </label>
                    <Select 
                      value={insuranceForm.request_type} 
                      onValueChange={(value) => setInsuranceForm({...insuranceForm, request_type: value})}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">🏢 Geschäftsversicherung</SelectItem>
                        <SelectItem value="private">👤 Privatversicherung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Priorität
                    </label>
                    <Select 
                      value={insuranceForm.priority} 
                      onValueChange={(value) => setInsuranceForm({...insuranceForm, priority: value})}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">🟢 Normal</SelectItem>
                        <SelectItem value="high">🟠 Hoch</SelectItem>
                        <SelectItem value="urgent">🔴 Dringend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {insuranceForm.request_type === 'business' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Firmenname"
                      value={insuranceForm.company_name}
                      onChange={(e) => setInsuranceForm({...insuranceForm, company_name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                    <Input
                      placeholder="Geschäftstätigkeit"
                      value={insuranceForm.business_type}
                      onChange={(e) => setInsuranceForm({...insuranceForm, business_type: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                    <Input
                      type="number"
                      placeholder="Jahresumsatz (€)"
                      value={insuranceForm.annual_revenue}
                      onChange={(e) => setInsuranceForm({...insuranceForm, annual_revenue: parseFloat(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                    <Input
                      type="number"
                      placeholder="Anzahl Mitarbeiter"
                      value={insuranceForm.employees}
                      onChange={(e) => setInsuranceForm({...insuranceForm, employees: parseInt(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Benötigte Versicherungen
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {[
                      'Betriebshaftpflicht',
                      'Cyber-Versicherung', 
                      'Rechtsschutz',
                      'Berufsunfähigkeit',
                      'Krankenversicherung',
                      'Lebensversicherung',
                      'D&O Versicherung',
                      'Hausratversicherung'
                    ].map(coverage => (
                      <Button
                        key={coverage}
                        variant={insuranceForm.coverage_needed.includes(coverage) ? "default" : "outline"}
                        size="sm"
                        onClick={() => insuranceForm.coverage_needed.includes(coverage) 
                          ? removeCoverageType(coverage) 
                          : addCoverageType(coverage)
                        }
                        className="text-xs"
                      >
                        {coverage}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insuranceForm.coverage_needed.map(coverage => (
                      <Badge key={coverage} variant="secondary" className="bg-blue-900 text-blue-200">
                        {coverage}
                        <button 
                          onClick={() => removeCoverageType(coverage)}
                          className="ml-1 text-blue-400 hover:text-blue-200"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder="Zusätzliche Notizen oder spezielle Anforderungen..."
                  value={insuranceForm.notes}
                  onChange={(e) => setInsuranceForm({...insuranceForm, notes: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                  rows={3}
                />

                <Button 
                  onClick={handleInsuranceRequest}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? '⏳ Wird gesendet...' : '🛡️ Versicherungsanfrage an Thomas Kaiser senden'}
                </Button>

                {dashboardData?.thomas_kaiser_contact && (
                  <Card className="bg-blue-900/20 border-blue-800">
                    <CardContent className="p-4">
                      <h4 className="text-blue-300 font-semibold mb-2">📞 Thomas Kaiser ERGO Kontakt:</h4>
                      <div className="text-sm text-slate-300 space-y-1">
                        <p><strong>Name:</strong> {dashboardData.thomas_kaiser_contact.name}</p>
                        <p><strong>Unternehmen:</strong> {dashboardData.thomas_kaiser_contact.company}</p>
                        <p><strong>Website:</strong> <a href={dashboardData.thomas_kaiser_contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{dashboardData.thomas_kaiser_contact.website}</a></p>
                        <p><strong>E-Mail:</strong> {dashboardData.thomas_kaiser_contact.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Calculation Tab */}
          <TabsContent value="tax" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-green-300 flex items-center gap-2">
                  📊 KI-Steuerberater & Buchhaltungs-Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Dokument-Typ
                    </label>
                    <Select 
                      value={newTaxDoc.document_type} 
                      onValueChange={(value) => setNewTaxDoc({...newTaxDoc, document_type: value})}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">💰 Einnahme</SelectItem>
                        <SelectItem value="expense">💸 Ausgabe</SelectItem>
                        <SelectItem value="receipt">🧾 Beleg</SelectItem>
                        <SelectItem value="invoice">📋 Rechnung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Betrag (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newTaxDoc.amount}
                      onChange={(e) => setNewTaxDoc({...newTaxDoc, amount: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Datum
                    </label>
                    <Input
                      type="date"
                      value={newTaxDoc.date}
                      onChange={(e) => setNewTaxDoc({...newTaxDoc, date: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Kategorie
                    </label>
                    <Input
                      placeholder="z.B. Bürokosten, Software, Marketing"
                      value={newTaxDoc.category}
                      onChange={(e) => setNewTaxDoc({...newTaxDoc, category: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Beschreibung
                  </label>
                  <Input
                    placeholder="Detaillierte Beschreibung des Postens"
                    value={newTaxDoc.description}
                    onChange={(e) => setNewTaxDoc({...newTaxDoc, description: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={newTaxDoc.is_deductible}
                      onChange={(e) => setNewTaxDoc({...newTaxDoc, is_deductible: e.target.checked})}
                      className="rounded"
                    />
                    Steuerlich absetzbar
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-slate-300 text-sm">USt-Satz:</label>
                    <Select 
                      value={newTaxDoc.vat_rate.toString()} 
                      onValueChange={(value) => setNewTaxDoc({...newTaxDoc, vat_rate: parseFloat(value)})}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="0.07">7%</SelectItem>
                        <SelectItem value="0.19">19%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={addTaxDocument}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  📄 Dokument hinzufügen
                </Button>

                {/* Tax Documents List */}
                {taxDocuments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-slate-300 font-semibold">Hinzugefügte Dokumente:</h4>
                    {taxDocuments.map((doc, index) => (
                      <Card key={index} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-slate-200 font-medium">{doc.description}</div>
                              <div className="text-sm text-slate-400">
                                {doc.document_type} • €{doc.amount.toFixed(2)} • {new Date(doc.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant={doc.document_type === 'income' ? 'default' : 'secondary'}>
                              {doc.document_type === 'income' ? '💰' : '💸'} €{doc.amount.toFixed(2)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button 
                      onClick={calculateTaxes}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    >
                      {loading ? '⏳ Berechnet...' : '🧮 KI-Steuerberechnung starten'}
                    </Button>
                  </div>
                )}

                {/* Tax Calculation Results */}
                {taxCalculation && (
                  <Card className="bg-green-900/20 border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-300">📊 Steuerberechnung Ergebnis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm">Gesamteinkommen</div>
                          <div className="text-green-400 font-bold text-lg">€{taxCalculation.summary.total_income.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">Gesamtausgaben</div>
                          <div className="text-red-400 font-bold text-lg">€{taxCalculation.summary.total_expenses.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">Gewinn/Verlust</div>
                          <div className={`font-bold text-lg ${taxCalculation.summary.profit_loss > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            €{taxCalculation.summary.profit_loss.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">Gesamte Steuerlast</div>
                          <div className="text-yellow-400 font-bold text-lg">€{taxCalculation.summary.total_tax_burden.toFixed(2)}</div>
                        </div>
                      </div>

                      {taxCalculation.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-slate-300 font-semibold mb-2">🤖 KI-Empfehlungen:</h5>
                          <ul className="space-y-1">
                            {taxCalculation.recommendations.map((rec, index) => (
                              <li key={index} className="text-slate-300 text-sm">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Documents Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  ⚖️ Rechtsdokument-Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Dokument-Typ
                    </label>
                    <Select 
                      value={legalForm.document_type} 
                      onValueChange={(value) => setLegalForm({...legalForm, document_type: value})}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agb">📋 AGB (Allgemeine Geschäftsbedingungen)</SelectItem>
                        <SelectItem value="dsgvo">🔒 DSGVO Datenschutzerklärung</SelectItem>
                        <SelectItem value="impressum">📄 Impressum</SelectItem>
                        <SelectItem value="contract">📑 Dienstleistungsvertrag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Firmenname
                    </label>
                    <Input
                      placeholder="ZZ-Lobby Elite"
                      value={legalForm.company_name}
                      onChange={(e) => setLegalForm({...legalForm, company_name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Geschäftsadresse
                    </label>
                    <Input
                      placeholder="06712 Zeitz, Deutschland"
                      value={legalForm.business_address}
                      onChange={(e) => setLegalForm({...legalForm, business_address: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Kontakt E-Mail
                    </label>
                    <Input
                      type="email"
                      placeholder="daniel@zz-lobby-elite.de"
                      value={legalForm.contact_email}
                      onChange={(e) => setLegalForm({...legalForm, contact_email: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      USt-ID (optional)
                    </label>
                    <Input
                      placeholder="DE123456789"
                      value={legalForm.vat_id}
                      onChange={(e) => setLegalForm({...legalForm, vat_id: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Geschäftstätigkeit
                    </label>
                    <Input
                      placeholder="Digital Business Automation"
                      value={legalForm.business_type}
                      onChange={(e) => setLegalForm({...legalForm, business_type: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-slate-200"
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateLegalDocument}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? '⏳ Generiert...' : '⚖️ Rechtsdokument generieren'}
                </Button>

                {/* Generated Document Display */}
                {generatedDocument && (
                  <Card className="bg-purple-900/20 border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-purple-300">
                        📄 Generiertes Dokument: {generatedDocument.type.toUpperCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
                        <pre className="text-slate-200 text-sm whitespace-pre-wrap">
                          {generatedDocument.content}
                        </pre>
                      </div>
                      <div className="mt-4 text-xs text-slate-400">
                        Generiert am: {new Date(generatedDocument.generated_date).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-yellow-300 flex items-center gap-2">
                  📧 Professioneller E-Mail-Service (Klaviyo)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Empfänger E-Mail
                  </label>
                  <Input
                    type="email"
                    placeholder="empfaenger@example.com"
                    value={emailForm.to_email}
                    onChange={(e) => setEmailForm({...emailForm, to_email: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Betreff
                  </label>
                  <Input
                    placeholder="E-Mail Betreff..."
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Nachricht
                  </label>
                  <Textarea
                    placeholder="Ihre professionelle E-Mail-Nachricht..."
                    value={emailForm.content}
                    onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-slate-200"
                    rows={8}
                  />
                </div>

                <Button 
                  onClick={sendBusinessEmail}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {loading ? '⏳ Wird gesendet...' : '📧 Business E-Mail senden'}
                </Button>

                <Card className="bg-yellow-900/20 border-yellow-800">
                  <CardContent className="p-4">
                    <h4 className="text-yellow-300 font-semibold mb-2">📧 E-Mail Features:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Professionelles ZZ-Lobby Elite Branding</li>
                      <li>• Automatische HTML-Formatierung</li>
                      <li>• Klaviyo-Integration für Tracking</li>
                      <li>• Responsive Design für alle Geräte</li>
                      <li>• Automatische Kontaktdaten-Signatur</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {dashboardData && (
              <>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-300 flex items-center gap-2">
                      👤 Daniel Oettel - Persönliche Daten
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm">Name</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.name}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Geburtsdatum</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.birth_date}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Geburtsort</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.birth_place}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Wohnort</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.address}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">E-Mail</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.email}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm">Unternehmen</div>
                      <div className="text-slate-200 font-medium">{dashboardData.daniel_info.company}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-300 flex items-center gap-2">
                      🚀 Verfügbare Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.available_services.map((service, index) => (
                        <Card key={index} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <h4 className="text-slate-200 font-semibold mb-1">{service.name}</h4>
                            <p className="text-slate-400 text-sm">{service.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {dashboardData.recent_activities.length > 0 && (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-300 flex items-center gap-2">
                        📈 Neueste Aktivitäten
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardData.recent_activities.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                            <div>
                              <div className="text-slate-200 font-medium">{activity.description}</div>
                              <div className="text-slate-400 text-sm">
                                {new Date(activity.date).toLocaleString()}
                              </div>
                            </div>
                            <Badge 
                              variant={activity.status === 'completed' ? 'default' : 'secondary'}
                              className={activity.status === 'completed' ? 'bg-green-900 text-green-200' : ''}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DigitalManager;
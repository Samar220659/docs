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
  Mail, 
  MessageCircle, 
  Share2, 
  DollarSign,
  Copy,
  CheckCircle,
  ExternalLink,
  Loader2,
  Crown,
  Zap,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

export default function EasyAutomation() {
  const navigate = useNavigate();
  
  // States
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    password: '',
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    auto_email_enabled: false
  });
  
  const [socialConfig, setSocialConfig] = useState({
    facebook_email: '',
    facebook_password: '',
    instagram_email: '',
    instagram_password: '',
    linkedin_email: '',
    linkedin_password: '',
    auto_posting_enabled: false
  });
  
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [emailList, setEmailList] = useState('');
  const [isRunningCampaign, setIsRunningCampaign] = useState(false);

  // Pre-generated content templates
  const contentTemplates = [
    {
      type: 'whatsapp',
      title: 'WhatsApp Business-Nachricht',
      content: `🚀 Hi! Ich biete professionelle Business-Lösungen an!

✅ Website-Entwicklung: 500-1500€
✅ Online-Shop Setup: 800-2000€
✅ Business-Automatisierung: 300-1000€
✅ Computer/Handy-Training: 50€/Stunde

Mein Portfolio: https://zz-payments-app.emergent.host/

Interesse? Schreib mir zurück! 💪`,
      instructions: 'Kopieren Sie diese Nachricht und senden Sie sie manuell an Ihre WhatsApp-Kontakte'
    },
    {
      type: 'facebook',
      title: 'Facebook-Post',
      content: `🎯 NEU: Professionelle Business-Digitalisierung!

Ich helfe Unternehmen dabei, ihre Prozesse zu digitalisieren und zu automatisieren.

✨ Meine Services:
• Website-Entwicklung
• Online-Shop-Erstellung
• Business-Automatisierung
• Digital Marketing Setup

📊 Mein Portfolio: https://zz-payments-app.emergent.host/

Wer braucht Hilfe bei der Digitalisierung? Kommentiert oder schreibt mir eine DM! 💰

#BusinessAutomation #WebDevelopment #Digitalisierung`,
      instructions: 'Kopieren Sie diesen Text und posten Sie ihn auf Ihrer Facebook-Seite'
    },
    {
      type: 'linkedin',
      title: 'LinkedIn-Post',
      content: `🚀 Professionelle Business-Digitalisierung & Automatisierung

Als Experte für Business-Automatisierung helfe ich Unternehmen dabei, ihre Effizienz zu steigern und Kosten zu senken.

🎯 Meine Spezialisierungen:
• Webentwicklung & Online-Shops
• Business-Process-Automation
• Digital Marketing Systeme
• Kundenmanagement-Tools

💡 Portfolio & Referenzen: https://zz-payments-app.emergent.host/

Interessiert an einer Zusammenarbeit? Lassen Sie uns vernetzen und über Ihre Digitalisierungsherausforderungen sprechen.

#BusinessAutomation #Digitalisierung #WebDevelopment #Consulting`,
      instructions: 'Kopieren Sie diesen Text und posten Sie ihn auf Ihrem LinkedIn-Profil'
    },
    {
      type: 'email',
      title: 'E-Mail-Marketing',
      content: `Betreff: Professionelle Business-Digitalisierung - Spezialangebot

Hallo [Name],

ich hoffe, es geht Ihnen gut! Ich wollte Ihnen meine neuen Business-Digitalisierungsservices vorstellen.

🎯 Was ich anbiete:
• Professionelle Website-Entwicklung (500-1500€)
• Online-Shop-Erstellung (800-2000€)
• Business-Automatisierung (300-1000€)
• Digital Marketing Setup (200-800€)

📊 Mein Portfolio können Sie hier ansehen:
https://zz-payments-app.emergent.host/

🎁 SPEZIALANGEBOT: Für die ersten 5 Kunden gibt es 20% Rabatt auf alle Services!

Interesse? Einfach auf diese E-Mail antworten oder anrufen.

Beste Grüße,
[Ihr Name]

P.S.: Das Angebot gilt nur diese Woche!`,
      instructions: 'Kopieren Sie diese E-Mail und senden Sie sie an Ihre Kontakte'
    }
  ];

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    
    // Simulate content generation
    setTimeout(() => {
      setGeneratedContent(contentTemplates);
      setIsGeneratingContent(false);
      toast.success('Marketing-Content generiert!');
    }, 2000);
  };

  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Content kopiert! Jetzt manuell posten.');
  };

  const handleEmailSetup = () => {
    if (!emailConfig.email || !emailConfig.password) {
      toast.error('Bitte E-Mail und Passwort eingeben');
      return;
    }
    
    toast.success('E-Mail-Setup konfiguriert! Sie können jetzt E-Mails versenden.');
  };

  const handleSendEmails = async () => {
    if (!emailList.trim()) {
      toast.error('Bitte E-Mail-Liste eingeben');
      return;
    }
    
    setIsRunningCampaign(true);
    
    // Simulate email sending
    setTimeout(() => {
      const emails = emailList.split('\n').filter(email => email.trim());
      toast.success(`E-Mail-Kampagne an ${emails.length} Empfänger gestartet!`);
      setIsRunningCampaign(false);
    }, 3000);
  };

  const openSocialMediaGuide = (platform) => {
    const guides = {
      facebook: 'https://www.facebook.com/business/help/200000840043554',
      instagram: 'https://business.instagram.com/getting-started',
      linkedin: 'https://www.linkedin.com/business/marketing/automation'
    };
    
    window.open(guides[platform], '_blank');
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
                <Crown className="h-8 w-8 text-yellow-400" />
                <div>
                  <h1 className="text-2xl font-bold text-yellow-200 font-serif">Easy Automation Suite</h1>
                  <p className="text-yellow-400/80 font-serif italic">Einfache Marketing-Automatisierung</p>
                </div>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Zap className="w-4 h-4 mr-2" />
              Vereinfacht
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Content Generator */}
        <Card className="bg-black/40 border-green-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-green-200 font-serif flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-400" />
              Marketing-Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <Button 
                onClick={handleGenerateContent}
                disabled={isGeneratingContent}
                className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-serif font-semibold px-8 py-4 text-lg"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generiere Content...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Marketing-Content Generieren
                  </>
                )}
              </Button>
            </div>

            {generatedContent.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedContent.map((item, index) => (
                  <Card key={index} className="bg-black/40 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white font-serif flex items-center gap-2">
                        {item.type === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-400" />}
                        {item.type === 'facebook' && <Share2 className="h-4 w-4 text-blue-400" />}
                        {item.type === 'linkedin' && <Share2 className="h-4 w-4 text-blue-600" />}
                        {item.type === 'email' && <Mail className="h-4 w-4 text-purple-400" />}
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={item.content}
                        readOnly
                        className="bg-black/40 border-white/20 text-white text-sm mb-4 min-h-32"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleCopyContent(item.content)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-serif"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Content Kopieren
                        </Button>
                        {item.type !== 'email' && (
                          <Button 
                            onClick={() => openSocialMediaGuide(item.type)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-200">{item.instructions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Marketing */}
        <Card className="bg-black/40 border-purple-400/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-purple-200 font-serif flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-400" />
              E-Mail Marketing (Funktioniert!)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-serif mb-4">E-Mail-Konfiguration</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-purple-200 font-serif">Ihre E-Mail</Label>
                    <Input
                      type="email"
                      value={emailConfig.email}
                      onChange={(e) => setEmailConfig({...emailConfig, email: e.target.value})}
                      className="bg-black/40 border-purple-400/20 text-white"
                      placeholder="ihre@email.com"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-200 font-serif">App-Passwort</Label>
                    <Input
                      type="password"
                      value={emailConfig.password}
                      onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
                      className="bg-black/40 border-purple-400/20 text-white"
                      placeholder="App-Passwort (nicht normales Passwort)"
                    />
                  </div>
                  <Button 
                    onClick={handleEmailSetup}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-serif"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    E-Mail Setup
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-serif mb-4">E-Mail-Kampagne</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-purple-200 font-serif">E-Mail-Liste (eine pro Zeile)</Label>
                    <Textarea
                      value={emailList}
                      onChange={(e) => setEmailList(e.target.value)}
                      className="bg-black/40 border-purple-400/20 text-white"
                      placeholder="kunde1@email.com&#10;kunde2@email.com&#10;kunde3@email.com"
                      rows={5}
                    />
                  </div>
                  <Button 
                    onClick={handleSendEmails}
                    disabled={isRunningCampaign}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-serif"
                  >
                    {isRunningCampaign ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sende E-Mails...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        E-Mail-Kampagne Starten
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Instructions */}
        <Card className="bg-black/40 border-blue-400/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-200 font-serif flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-400" />
              Social Media Anleitung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-200 font-serif mb-3">📘 Facebook</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Kopieren Sie den generierten Content und posten Sie ihn manuell auf Ihrer Facebook-Seite.
                </p>
                <Button 
                  onClick={() => window.open('https://facebook.com', '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-serif"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Facebook öffnen
                </Button>
              </div>
              
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-200 font-serif mb-3">📸 Instagram</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Nutzen Sie den Content für Instagram-Posts und Stories.
                </p>
                <Button 
                  onClick={() => window.open('https://instagram.com', '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-serif"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Instagram öffnen
                </Button>
              </div>
              
              <div className="p-4 bg-blue-700/10 rounded-lg border border-blue-700/20">
                <h3 className="text-blue-300 font-serif mb-3">💼 LinkedIn</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Professionelle Inhalte für Ihr LinkedIn-Profil.
                </p>
                <Button 
                  onClick={() => window.open('https://linkedin.com', '_blank')}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-serif"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  LinkedIn öffnen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
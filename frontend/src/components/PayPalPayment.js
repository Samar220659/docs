import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  QrCode, 
  DollarSign, 
  Copy, 
  Share2, 
  CheckCircle,
  CreditCard,
  Link
} from "lucide-react";
import { toast } from "sonner";
import { mockData } from "../utils/mock";

export default function PayPalPayment() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedPayment, setGeneratedPayment] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Bitte geben Sie einen gültigen Betrag ein");
      return;
    }

    setIsGenerating(true);
    
    // Simulate payment generation
    setTimeout(() => {
      const paymentData = {
        id: `PAY-${Date.now()}`,
        amount: parseFloat(amount),
        description: description || "ZZ-Lobby Elite Payment",
        paymentUrl: mockData.paymentLinks.find(p => p.amount === parseFloat(amount))?.url || 
                   `https://paypal.me/zzlobby/${amount}EUR`,
        qrCode: `data:image/svg+xml;base64,${btoa(`
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white"/>
            <g fill="black">
              <rect x="20" y="20" width="10" height="10"/>
              <rect x="30" y="20" width="10" height="10"/>
              <rect x="50" y="20" width="10" height="10"/>
              <rect x="70" y="20" width="10" height="10"/>
              <rect x="90" y="20" width="10" height="10"/>
              <rect x="110" y="20" width="10" height="10"/>
              <rect x="130" y="20" width="10" height="10"/>
              <rect x="150" y="20" width="10" height="10"/>
              <rect x="170" y="20" width="10" height="10"/>
              <rect x="20" y="30" width="10" height="10"/>
              <rect x="50" y="30" width="10" height="10"/>
              <rect x="90" y="30" width="10" height="10"/>
              <rect x="130" y="30" width="10" height="10"/>
              <rect x="170" y="30" width="10" height="10"/>
              <rect x="20" y="50" width="10" height="10"/>
              <rect x="40" y="50" width="10" height="10"/>
              <rect x="70" y="50" width="10" height="10"/>
              <rect x="100" y="50" width="10" height="10"/>
              <rect x="130" y="50" width="10" height="10"/>
              <rect x="160" y="50" width="10" height="10"/>
              <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">€${amount}</text>
              <text x="100" y="120" text-anchor="middle" font-size="8" fill="black">ZZ-Lobby Elite</text>
            </g>
          </svg>
        `)}`,
        createdAt: new Date().toISOString(),
        status: "active"
      };
      
      setGeneratedPayment(paymentData);
      setIsGenerating(false);
      toast.success("Payment-Link erfolgreich generiert!");
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedPayment.paymentUrl);
    toast.success("Payment-Link kopiert!");
  };

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ZZ-Lobby Elite Payment',
        text: `Zahlung von €${generatedPayment.amount} angefordert`,
        url: generatedPayment.paymentUrl
      });
    } else {
      handleCopyLink();
    }
  };

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
                <h1 className="text-xl font-bold">PayPal QR-Code</h1>
                <p className="text-sm text-gray-400">Instant Payment System</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <CreditCard className="w-3 h-3 mr-2" />
              PayPal
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!generatedPayment ? (
          // Payment Generation Form
          <Card className="bg-black/40 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                Neue Zahlung erstellen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Betrag (EUR)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/40 border-white/20 text-white text-lg h-12"
                  step="0.01"
                  min="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Beschreibung (optional)
                </Label>
                <Input
                  id="description"
                  placeholder="z.B. ZZ-Lobby Elite Subscription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-black/40 border-white/20 text-white"
                />
              </div>

              <Button 
                onClick={handleGeneratePayment}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold h-12"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Generiere Payment...
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    QR-Code & Link generieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Generated Payment Display
          <div className="space-y-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Payment erfolgreich erstellt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 inline-block mb-4">
                      <img 
                        src={generatedPayment.qrCode} 
                        alt="PayPal QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      QR-Code scannen für sofortige Zahlung
                    </p>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Betrag:</span>
                        <span className="text-xl font-bold text-green-400">€{generatedPayment.amount}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Beschreibung:</span>
                        <span className="text-sm">{generatedPayment.description}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Status:</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          {generatedPayment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Payment-Link:</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={generatedPayment.paymentUrl}
                          readOnly
                          className="bg-black/40 border-white/20 text-white text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCopyLink}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleShareLink}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Teilen
                      </Button>
                      <Button 
                        onClick={() => setGeneratedPayment(null)}
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Neue Zahlung
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Payments */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-400" />
              Kürzliche Zahlungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.paymentLinks.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="font-medium">€{payment.amount}</div>
                      <div className="text-sm text-gray-400">{payment.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 mb-1">
                      {payment.status}
                    </Badge>
                    <div className="text-xs text-gray-500">{payment.createdAt}</div>
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
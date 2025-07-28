import { 
  Bot, 
  Users, 
  Share2, 
  Mail, 
  DollarSign 
} from "lucide-react";

export const mockData = {
  // Dashboard Statistics
  dashboardStats: {
    todayEarnings: "247.83",
    todayGrowth: 12.5,
    activeLeads: 89,
    newLeads: 23,
    conversionRate: 18.7,
    activeAutomations: 4,
    systemPerformance: 92
  },

  // PayPal Payment Links
  paymentLinks: [
    {
      id: "PAY-001",
      amount: 10.00,
      description: "ZZ-Lobby Elite Test Payment",
      url: "https://paypal.me/zzlobby/10EUR",
      status: "active",
      createdAt: "Heute, 14:30"
    },
    {
      id: "PAY-002", 
      amount: 25.00,
      description: "Premium Subscription",
      url: "https://paypal.me/zzlobby/25EUR",
      status: "completed",
      createdAt: "Heute, 12:15"
    },
    {
      id: "PAY-003",
      amount: 50.00,
      description: "Advanced Package",
      url: "https://paypal.me/zzlobby/50EUR", 
      status: "pending",
      createdAt: "Gestern, 16:45"
    }
  ],

  // Automation Systems
  automations: [
    {
      id: "lead-capture",
      name: "Lead Capture System",
      description: "Automatische Lead-Generierung über alle Kanäle mit KI-gestützter Qualifizierung",
      icon: Users,
      color: "#3B82F6",
      active: true,
      status: "active",
      performance: 94,
      todayGenerated: "47 Leads",
      successRate: 89
    },
    {
      id: "social-media",
      name: "Social Media Automation",
      description: "Automatisierte Posts und Engagement auf TikTok, Instagram, LinkedIn, YouTube",
      icon: Share2,
      color: "#8B5CF6",
      active: true,
      status: "active", 
      performance: 87,
      todayGenerated: "156 Interaktionen",
      successRate: 76
    },
    {
      id: "email-marketing",
      name: "Email Marketing Engine",
      description: "Automatisierte E-Mail-Sequenzen mit personalisierten Inhalten",
      icon: Mail,
      color: "#10B981",
      active: false,
      status: "inactive",
      performance: 0,
      todayGenerated: "0 E-Mails",
      successRate: 0
    },
    {
      id: "affiliate-marketing",
      name: "Affiliate Marketing Bot",
      description: "Automatische Bewerbung von Affiliate-Produkten mit optimierter Conversion",
      icon: DollarSign,
      color: "#F59E0B",
      active: true,
      status: "active",
      performance: 91,
      todayGenerated: "€127.50",
      successRate: 82
    },
    {
      id: "ai-content",
      name: "KI Content Generator",
      description: "Automatische Erstellung von Content für alle Social Media Plattformen",
      icon: Bot,
      color: "#EF4444",
      active: false,
      status: "paused",
      performance: 45,
      todayGenerated: "12 Posts",
      successRate: 67
    }
  ],

  // Analytics Data
  analytics: {
    revenue: {
      today: 247.83,
      week: 1450.67,
      month: 6789.45,
      growth: 23.5
    },
    leads: {
      total: 1247,
      qualified: 456,
      converted: 89,
      conversionRate: 18.7
    },
    traffic: {
      organic: 67,
      paid: 23,
      referral: 8,
      direct: 2
    },
    platforms: [
      { name: "TikTok", performance: 94, leads: 234 },
      { name: "Instagram", performance: 87, leads: 189 },
      { name: "YouTube", performance: 76, leads: 156 },
      { name: "LinkedIn", performance: 82, leads: 123 },
      { name: "Reddit", performance: 69, leads: 98 }
    ]
  },

  // SaaS System Status
  saasStatus: {
    systemHealth: 98,
    uptime: "99.9%",
    activeUsers: 1247,
    totalRevenue: 45678.90,
    monthlyGrowth: 34.7,
    components: [
      { name: "Lead Generation Engine", status: "online", performance: 96 },
      { name: "Payment Processing", status: "online", performance: 99 },
      { name: "Social Media Automation", status: "online", performance: 87 },
      { name: "Email Marketing", status: "maintenance", performance: 0 },
      { name: "Analytics Dashboard", status: "online", performance: 94 },
      { name: "AI Content Generator", status: "online", performance: 78 }
    ]
  }
};
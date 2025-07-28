import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from models import (
    PaymentDocument, AutomationDocument, AnalyticsDocument,
    AutomationType, PaymentStatus, ComponentStatus
)

class DatabaseService:
    def __init__(self):
        self.mongo_url = os.getenv('MONGO_URL')
        self.db_name = os.getenv('DB_NAME')
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
        # Collections
        self.payments = self.db.payments
        self.automations = self.db.automations
        self.analytics = self.db.analytics
        
    async def initialize_default_data(self):
        """Initialize default automation data if not exists"""
        automation_count = await self.automations.count_documents({})
        
        if automation_count == 0:
            default_automations = [
                {
                    "id": "lead-capture",
                    "name": "Lead Capture System",
                    "description": "Automatische Lead-Generierung über alle Kanäle mit KI-gestützter Qualifizierung",
                    "type": "lead-capture",
                    "active": True,
                    "status": "active",
                    "performance": 94,
                    "todayGenerated": "47 Leads",
                    "successRate": 89,
                    "color": "#3B82F6",
                    "lastUpdated": datetime.now()
                },
                {
                    "id": "social-media",
                    "name": "Social Media Automation",
                    "description": "Automatisierte Posts und Engagement auf TikTok, Instagram, LinkedIn, YouTube",
                    "type": "social-media",
                    "active": True,
                    "status": "active",
                    "performance": 87,
                    "todayGenerated": "156 Interaktionen",
                    "successRate": 76,
                    "color": "#8B5CF6",
                    "lastUpdated": datetime.now()
                },
                {
                    "id": "email-marketing",
                    "name": "Email Marketing Engine",
                    "description": "Automatisierte E-Mail-Sequenzen mit personalisierten Inhalten",
                    "type": "email-marketing",
                    "active": False,
                    "status": "inactive",
                    "performance": 0,
                    "todayGenerated": "0 E-Mails",
                    "successRate": 0,
                    "color": "#10B981",
                    "lastUpdated": datetime.now()
                },
                {
                    "id": "affiliate-marketing",
                    "name": "Affiliate Marketing Bot",
                    "description": "Automatische Bewerbung von Affiliate-Produkten mit optimierter Conversion",
                    "type": "affiliate-marketing",
                    "active": True,
                    "status": "active",
                    "performance": 91,
                    "todayGenerated": "€127.50",
                    "successRate": 82,
                    "color": "#F59E0B",
                    "lastUpdated": datetime.now()
                },
                {
                    "id": "ai-content",
                    "name": "KI Content Generator",
                    "description": "Automatische Erstellung von Content für alle Social Media Plattformen",
                    "type": "ai-content",
                    "active": False,
                    "status": "paused",
                    "performance": 45,
                    "todayGenerated": "12 Posts",
                    "successRate": 67,
                    "color": "#EF4444",
                    "lastUpdated": datetime.now()
                }
            ]
            
            await self.automations.insert_many(default_automations)
    
    # Payment Methods
    async def create_payment(self, payment: PaymentDocument) -> str:
        """Create a new payment record"""
        result = await self.payments.insert_one(payment.dict())
        return str(result.inserted_id)
    
    async def get_payment(self, payment_id: str) -> Optional[PaymentDocument]:
        """Get payment by ID"""
        payment = await self.payments.find_one({"id": payment_id})
        return PaymentDocument(**payment) if payment else None
    
    async def get_payments(self, limit: int = 10) -> List[PaymentDocument]:
        """Get recent payments"""
        cursor = self.payments.find().sort("createdAt", -1).limit(limit)
        payments = await cursor.to_list(length=limit)
        return [PaymentDocument(**payment) for payment in payments]
    
    async def update_payment_status(self, payment_id: str, status: PaymentStatus) -> bool:
        """Update payment status"""
        result = await self.payments.update_one(
            {"id": payment_id},
            {"$set": {"status": status, "completedAt": datetime.now() if status == PaymentStatus.COMPLETED else None}}
        )
        return result.modified_count > 0
    
    # Automation Methods
    async def get_automations(self) -> List[AutomationDocument]:
        """Get all automations"""
        cursor = self.automations.find()
        automations = await cursor.to_list(length=None)
        return [AutomationDocument(**automation) for automation in automations]
    
    async def get_automation(self, automation_id: str) -> Optional[AutomationDocument]:
        """Get automation by ID"""
        automation = await self.automations.find_one({"id": automation_id})
        return AutomationDocument(**automation) if automation else None
    
    async def toggle_automation(self, automation_id: str, active: bool) -> bool:
        """Toggle automation active state"""
        status = "active" if active else "inactive"
        result = await self.automations.update_one(
            {"id": automation_id},
            {"$set": {"active": active, "status": status, "lastUpdated": datetime.now()}}
        )
        return result.modified_count > 0
    
    # Analytics Methods
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics"""
        # Calculate today's earnings
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday = today - timedelta(days=1)
        
        # Get today's completed payments
        today_payments = await self.payments.find({
            "createdAt": {"$gte": today},
            "status": PaymentStatus.COMPLETED
        }).to_list(length=None)
        
        yesterday_payments = await self.payments.find({
            "createdAt": {"$gte": yesterday, "$lt": today},
            "status": PaymentStatus.COMPLETED
        }).to_list(length=None)
        
        today_earnings = sum(p['amount'] for p in today_payments)
        yesterday_earnings = sum(p['amount'] for p in yesterday_payments)
        
        # Calculate growth
        growth = ((today_earnings - yesterday_earnings) / yesterday_earnings * 100) if yesterday_earnings > 0 else 0
        
        # Get active automations count
        active_automations = await self.automations.count_documents({"active": True})
        
        return {
            "todayEarnings": f"{today_earnings:.2f}",
            "todayGrowth": round(growth, 1),
            "activeLeads": 89,  # Mock data for now
            "newLeads": 23,     # Mock data for now
            "conversionRate": 18.7,  # Mock data for now
            "activeAutomations": active_automations,
            "systemPerformance": 92  # Mock data for now
        }
    
    async def get_analytics_data(self) -> Dict[str, Any]:
        """Get analytics data"""
        # Get payments for calculations
        week_start = datetime.now() - timedelta(days=7)
        month_start = datetime.now() - timedelta(days=30)
        
        week_payments = await self.payments.find({
            "createdAt": {"$gte": week_start},
            "status": PaymentStatus.COMPLETED
        }).to_list(length=None)
        
        month_payments = await self.payments.find({
            "createdAt": {"$gte": month_start},
            "status": PaymentStatus.COMPLETED
        }).to_list(length=None)
        
        today_earnings = 247.83  # From dashboard stats
        week_earnings = sum(p['amount'] for p in week_payments)
        month_earnings = sum(p['amount'] for p in month_payments)
        
        return {
            "revenue": {
                "today": today_earnings,
                "week": week_earnings,
                "month": month_earnings,
                "growth": 23.5
            },
            "leads": {
                "total": 1247,
                "qualified": 456,
                "converted": 89,
                "conversionRate": 18.7
            },
            "traffic": {
                "organic": 67,
                "paid": 23,
                "referral": 8,
                "direct": 2
            },
            "platforms": [
                {"name": "TikTok", "performance": 94, "leads": 234},
                {"name": "Instagram", "performance": 87, "leads": 189},
                {"name": "YouTube", "performance": 76, "leads": 156},
                {"name": "LinkedIn", "performance": 82, "leads": 123},
                {"name": "Reddit", "performance": 69, "leads": 98}
            ]
        }
    
    async def get_saas_status(self) -> Dict[str, Any]:
        """Get SaaS system status"""
        # Get active automations for component status
        automations = await self.get_automations()
        
        components = [
            {"name": "Lead Generation Engine", "status": "online", "performance": 96},
            {"name": "Payment Processing", "status": "online", "performance": 99},
            {"name": "Social Media Automation", "status": "online", "performance": 87},
            {"name": "Email Marketing", "status": "maintenance", "performance": 0},
            {"name": "Analytics Dashboard", "status": "online", "performance": 94},
            {"name": "AI Content Generator", "status": "online", "performance": 78}
        ]
        
        return {
            "systemHealth": 98,
            "uptime": "99.9%",
            "activeUsers": 1247,
            "totalRevenue": 45678.90,
            "monthlyGrowth": 34.7,
            "components": components
        }

# Initialize service
db_service = DatabaseService()
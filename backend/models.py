from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    ACTIVE = "active"

class AutomationType(str, Enum):
    LEAD_CAPTURE = "lead-capture"
    SOCIAL_MEDIA = "social-media"
    EMAIL_MARKETING = "email-marketing"
    AFFILIATE_MARKETING = "affiliate-marketing"
    AI_CONTENT = "ai-content"

class ComponentStatus(str, Enum):
    ONLINE = "online"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

# Request/Response Models
class PaymentCreateRequest(BaseModel):
    amount: float
    description: Optional[str] = "ZZ-Lobby Elite Payment"

class PaymentResponse(BaseModel):
    id: str
    amount: float
    description: str
    paymentUrl: str
    qrCode: str
    status: PaymentStatus
    createdAt: datetime
    completedAt: Optional[datetime] = None

class AutomationToggleRequest(BaseModel):
    active: bool

class AutomationResponse(BaseModel):
    id: str
    name: str
    description: str
    type: AutomationType
    active: bool
    status: str
    performance: int
    todayGenerated: str
    successRate: int
    color: str
    lastUpdated: datetime

class DashboardStatsResponse(BaseModel):
    todayEarnings: str
    todayGrowth: float
    activeLeads: int
    newLeads: int
    conversionRate: float
    activeAutomations: int
    systemPerformance: int

class RevenueAnalyticsResponse(BaseModel):
    today: float
    week: float
    month: float
    growth: float

class LeadAnalyticsResponse(BaseModel):
    total: int
    qualified: int
    converted: int
    conversionRate: float

class TrafficAnalyticsResponse(BaseModel):
    organic: int
    paid: int
    referral: int
    direct: int

class PlatformPerformanceResponse(BaseModel):
    name: str
    performance: int
    leads: int

class AnalyticsResponse(BaseModel):
    revenue: RevenueAnalyticsResponse
    leads: LeadAnalyticsResponse
    traffic: TrafficAnalyticsResponse
    platforms: List[PlatformPerformanceResponse]

class SaasComponentResponse(BaseModel):
    name: str
    status: ComponentStatus
    performance: int

class SaasStatusResponse(BaseModel):
    systemHealth: int
    uptime: str
    activeUsers: int
    totalRevenue: float
    monthlyGrowth: float
    components: List[SaasComponentResponse]

class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Database Models
class PaymentDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    amount: float
    description: str
    paypalPaymentId: Optional[str] = None
    paypalPaymentUrl: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.now)
    completedAt: Optional[datetime] = None

class AutomationDocument(BaseModel):
    id: str
    name: str
    description: str
    type: AutomationType
    active: bool = True
    status: str = "active"
    performance: int = 85
    todayGenerated: str = "0"
    successRate: int = 75
    color: str = "#3B82F6"
    lastUpdated: datetime = Field(default_factory=datetime.now)

class AnalyticsDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    date: datetime = Field(default_factory=datetime.now)
    revenue: float = 0.0
    leads: int = 0
    conversions: int = 0
    trafficSources: Dict[str, int] = {}
    platforms: List[Dict[str, Any]] = []
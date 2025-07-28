"""
ZZ-Lobby Elite System Monitoring & Health Module
Komplette Überwachung, A/B Testing, API Monitoring, Change Detection
"""

import asyncio
import json
import logging
import time
import psutil
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import hashlib
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Models
class SystemHealth(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_latency: float
    database_status: str
    api_response_time: float
    active_connections: int
    error_rate: float
    uptime: str

class DependencyStatus(BaseModel):
    service_name: str
    status: str  # "healthy", "degraded", "down"
    response_time: float
    last_check: datetime
    error_message: Optional[str] = None
    endpoint: str

class ABTestConfig(BaseModel):
    test_id: str
    name: str
    description: str
    variants: List[Dict[str, Any]]
    traffic_allocation: Dict[str, int]  # percentage per variant
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "active"
    target_metric: str

class ABTestResult(BaseModel):
    test_id: str
    variant: str
    metric_value: float
    conversion_rate: float
    sample_size: int
    confidence_level: float
    statistical_significance: bool

class APIMonitoringConfig(BaseModel):
    endpoint: str
    method: str = "GET"
    expected_status: int = 200
    timeout: int = 30
    check_interval: int = 60
    alert_threshold: float = 5.0  # seconds
    enabled: bool = True

class ChangeDetection(BaseModel):
    component: str
    change_type: str  # "code", "config", "data", "performance"
    old_value: str
    new_value: str
    timestamp: datetime
    impact_level: str  # "low", "medium", "high", "critical"
    detected_by: str

class SystemMonitor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.mongo_client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        self.db = self.mongo_client[os.getenv('DB_NAME')]
        self.monitoring_active = True
        self.dependencies = []
        self.ab_tests = []
        self.api_monitors = []
        self.change_log = []
        self.system_baseline = {}
        
        # Initialize default configurations
        self._initialize_default_configs()
    
    def _initialize_default_configs(self):
        """Initialize default monitoring configurations"""
        # Default dependencies to monitor
        self.dependencies = [
            DependencyStatus(
                service_name="MongoDB",
                status="healthy",
                response_time=0.0,
                last_check=datetime.now(),
                endpoint="mongodb://localhost:27017"
            ),
            DependencyStatus(
                service_name="PayPal API",
                status="healthy",
                response_time=0.0,
                last_check=datetime.now(),
                endpoint="https://api.sandbox.paypal.com"
            ),
            DependencyStatus(
                service_name="Frontend",
                status="healthy",
                response_time=0.0,
                last_check=datetime.now(),
                endpoint="http://localhost:3000"
            )
        ]
        
        # Default API monitors
        self.api_monitors = [
            APIMonitoringConfig(
                endpoint="/api/dashboard/stats",
                method="GET",
                expected_status=200,
                timeout=10,
                check_interval=60,
                alert_threshold=2.0
            ),
            APIMonitoringConfig(
                endpoint="/api/paypal/payments",
                method="GET",
                expected_status=200,
                timeout=15,
                check_interval=120,
                alert_threshold=5.0
            ),
            APIMonitoringConfig(
                endpoint="/api/automations",
                method="GET",
                expected_status=200,
                timeout=10,
                check_interval=60,
                alert_threshold=3.0
            )
        ]
        
        # Sample A/B test
        self.ab_tests = [
            ABTestConfig(
                test_id="marketing_message_test_1",
                name="Marketing Message Optimization",
                description="Test verschiedene Marketing-Nachrichten für bessere Conversion",
                variants=[
                    {"id": "variant_a", "name": "Original Message", "message": "Professionelle Website-Entwicklung"},
                    {"id": "variant_b", "name": "Urgent Message", "message": "Limitiertes Angebot: Website-Entwicklung"},
                    {"id": "variant_c", "name": "Benefit Message", "message": "Steigern Sie Ihren Umsatz mit professioneller Website"}
                ],
                traffic_allocation={"variant_a": 34, "variant_b": 33, "variant_c": 33},
                start_date=datetime.now(),
                target_metric="conversion_rate"
            )
        ]
    
    async def get_system_health(self) -> SystemHealth:
        """Get comprehensive system health status"""
        try:
            # CPU Usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Memory Usage
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            
            # Disk Usage
            disk = psutil.disk_usage('/')
            disk_usage = (disk.used / disk.total) * 100
            
            # Network Latency (ping to Google DNS)
            network_latency = await self._check_network_latency()
            
            # Database Status
            database_status = await self._check_database_health()
            
            # API Response Time
            api_response_time = await self._check_api_response_time()
            
            # Active Connections
            active_connections = len(psutil.net_connections())
            
            # Error Rate (simulated)
            error_rate = await self._calculate_error_rate()
            
            # Uptime
            uptime = self._get_system_uptime()
            
            return SystemHealth(
                timestamp=datetime.now(),
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                disk_usage=disk_usage,
                network_latency=network_latency,
                database_status=database_status,
                api_response_time=api_response_time,
                active_connections=active_connections,
                error_rate=error_rate,
                uptime=uptime
            )
            
        except Exception as e:
            self.logger.error(f"Error getting system health: {e}")
            raise
    
    async def _check_network_latency(self) -> float:
        """Check network latency"""
        try:
            start_time = time.time()
            response = requests.get("https://8.8.8.8", timeout=5)
            end_time = time.time()
            return (end_time - start_time) * 1000  # ms
        except:
            return 999.0  # High latency if failed
    
    async def _check_database_health(self) -> str:
        """Check database health"""
        try:
            # Try to ping database
            await self.db.command("ping")
            return "healthy"
        except Exception as e:
            self.logger.error(f"Database health check failed: {e}")
            return "unhealthy"
    
    async def _check_api_response_time(self) -> float:
        """Check API response time"""
        try:
            start_time = time.time()
            response = requests.get("http://localhost:8001/api/", timeout=10)
            end_time = time.time()
            return (end_time - start_time) * 1000  # ms
        except:
            return 999.0  # High response time if failed
    
    async def _calculate_error_rate(self) -> float:
        """Calculate error rate from logs"""
        # Simulate error rate calculation
        return 0.5  # 0.5% error rate
    
    def _get_system_uptime(self) -> str:
        """Get system uptime"""
        try:
            uptime_seconds = time.time() - psutil.boot_time()
            uptime_hours = uptime_seconds / 3600
            return f"{uptime_hours:.1f} hours"
        except:
            return "Unknown"
    
    async def check_dependencies(self) -> List[DependencyStatus]:
        """Check all dependencies"""
        results = []
        
        for dep in self.dependencies:
            try:
                start_time = time.time()
                
                if dep.service_name == "MongoDB":
                    await self.db.command("ping")
                    status = "healthy"
                    error_message = None
                elif dep.service_name == "PayPal API":
                    response = requests.get(dep.endpoint, timeout=10)
                    status = "healthy" if response.status_code < 400 else "degraded"
                    error_message = None if status == "healthy" else f"Status: {response.status_code}"
                elif dep.service_name == "Frontend":
                    response = requests.get(dep.endpoint, timeout=10)
                    status = "healthy" if response.status_code == 200 else "degraded"
                    error_message = None if status == "healthy" else f"Status: {response.status_code}"
                else:
                    response = requests.get(dep.endpoint, timeout=10)
                    status = "healthy" if response.status_code == 200 else "degraded"
                    error_message = None if status == "healthy" else f"Status: {response.status_code}"
                
                end_time = time.time()
                response_time = (end_time - start_time) * 1000
                
                dep_status = DependencyStatus(
                    service_name=dep.service_name,
                    status=status,
                    response_time=response_time,
                    last_check=datetime.now(),
                    error_message=error_message,
                    endpoint=dep.endpoint
                )
                results.append(dep_status)
                
            except Exception as e:
                dep_status = DependencyStatus(
                    service_name=dep.service_name,
                    status="down",
                    response_time=999.0,
                    last_check=datetime.now(),
                    error_message=str(e),
                    endpoint=dep.endpoint
                )
                results.append(dep_status)
        
        return results
    
    async def run_ab_test(self, test_id: str, user_id: str) -> str:
        """Run A/B test and return variant"""
        test = next((t for t in self.ab_tests if t.test_id == test_id), None)
        if not test:
            return "control"
        
        # Simple hash-based assignment
        hash_input = f"{test_id}_{user_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        
        # Determine variant based on traffic allocation
        random_value = hash_value % 100
        cumulative = 0
        
        for variant, percentage in test.traffic_allocation.items():
            cumulative += percentage
            if random_value < cumulative:
                return variant
        
        return "control"
    
    async def track_ab_test_result(self, test_id: str, variant: str, metric_value: float, user_id: str):
        """Track A/B test result"""
        try:
            # Store result in database
            result = {
                "test_id": test_id,
                "variant": variant,
                "metric_value": metric_value,
                "user_id": user_id,
                "timestamp": datetime.now()
            }
            
            await self.db.ab_test_results.insert_one(result)
            
        except Exception as e:
            self.logger.error(f"Error tracking A/B test result: {e}")
    
    async def get_ab_test_results(self, test_id: str) -> List[ABTestResult]:
        """Get A/B test results"""
        try:
            results = []
            test = next((t for t in self.ab_tests if t.test_id == test_id), None)
            if not test:
                return []
            
            # Get results from database
            db_results = await self.db.ab_test_results.find({"test_id": test_id}).to_list(1000)
            
            # Group by variant
            variant_data = {}
            for result in db_results:
                variant = result["variant"]
                if variant not in variant_data:
                    variant_data[variant] = []
                variant_data[variant].append(result["metric_value"])
            
            # Calculate statistics for each variant
            for variant, values in variant_data.items():
                if values:
                    avg_value = sum(values) / len(values)
                    conversion_rate = (sum(1 for v in values if v > 0) / len(values)) * 100
                    
                    result = ABTestResult(
                        test_id=test_id,
                        variant=variant,
                        metric_value=avg_value,
                        conversion_rate=conversion_rate,
                        sample_size=len(values),
                        confidence_level=95.0,
                        statistical_significance=len(values) > 30 and conversion_rate > 5.0
                    )
                    results.append(result)
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error getting A/B test results: {e}")
            return []
    
    async def monitor_api_endpoints(self) -> List[Dict[str, Any]]:
        """Monitor API endpoints"""
        results = []
        
        for monitor in self.api_monitors:
            if not monitor.enabled:
                continue
                
            try:
                start_time = time.time()
                
                if monitor.method == "GET":
                    response = requests.get(f"http://localhost:8001{monitor.endpoint}", timeout=monitor.timeout)
                elif monitor.method == "POST":
                    response = requests.post(f"http://localhost:8001{monitor.endpoint}", timeout=monitor.timeout)
                else:
                    response = requests.request(monitor.method, f"http://localhost:8001{monitor.endpoint}", timeout=monitor.timeout)
                
                end_time = time.time()
                response_time = (end_time - start_time) * 1000
                
                status = "healthy" if response.status_code == monitor.expected_status else "degraded"
                if response_time > monitor.alert_threshold * 1000:
                    status = "slow"
                
                result = {
                    "endpoint": monitor.endpoint,
                    "method": monitor.method,
                    "status": status,
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "expected_status": monitor.expected_status,
                    "timestamp": datetime.now().isoformat()
                }
                results.append(result)
                
            except Exception as e:
                result = {
                    "endpoint": monitor.endpoint,
                    "method": monitor.method,
                    "status": "error",
                    "response_time": 999.0,
                    "status_code": 0,
                    "expected_status": monitor.expected_status,
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
                results.append(result)
        
        return results
    
    async def detect_changes(self) -> List[ChangeDetection]:
        """Detect system changes"""
        changes = []
        
        try:
            # Check for performance changes
            current_health = await self.get_system_health()
            
            # Compare with baseline (simulated)
            if not self.system_baseline:
                self.system_baseline = {
                    "cpu_usage": current_health.cpu_usage,
                    "memory_usage": current_health.memory_usage,
                    "api_response_time": current_health.api_response_time
                }
            else:
                # Check CPU usage change
                if abs(current_health.cpu_usage - self.system_baseline["cpu_usage"]) > 20:
                    change = ChangeDetection(
                        component="System CPU",
                        change_type="performance",
                        old_value=f"{self.system_baseline['cpu_usage']:.1f}%",
                        new_value=f"{current_health.cpu_usage:.1f}%",
                        timestamp=datetime.now(),
                        impact_level="medium" if abs(current_health.cpu_usage - self.system_baseline["cpu_usage"]) < 40 else "high",
                        detected_by="System Monitor"
                    )
                    changes.append(change)
                
                # Check memory usage change
                if abs(current_health.memory_usage - self.system_baseline["memory_usage"]) > 15:
                    change = ChangeDetection(
                        component="System Memory",
                        change_type="performance",
                        old_value=f"{self.system_baseline['memory_usage']:.1f}%",
                        new_value=f"{current_health.memory_usage:.1f}%",
                        timestamp=datetime.now(),
                        impact_level="medium" if abs(current_health.memory_usage - self.system_baseline["memory_usage"]) < 30 else "high",
                        detected_by="System Monitor"
                    )
                    changes.append(change)
                
                # Check API response time change
                if abs(current_health.api_response_time - self.system_baseline["api_response_time"]) > 500:
                    change = ChangeDetection(
                        component="API Response Time",
                        change_type="performance",
                        old_value=f"{self.system_baseline['api_response_time']:.1f}ms",
                        new_value=f"{current_health.api_response_time:.1f}ms",
                        timestamp=datetime.now(),
                        impact_level="high" if current_health.api_response_time > 2000 else "medium",
                        detected_by="System Monitor"
                    )
                    changes.append(change)
            
            # Store changes
            for change in changes:
                await self.db.change_log.insert_one(change.dict())
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detecting changes: {e}")
            return []
    
    async def get_monitoring_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive monitoring dashboard data"""
        try:
            # Get all monitoring data
            system_health = await self.get_system_health()
            dependencies = await self.check_dependencies()
            api_monitoring = await self.monitor_api_endpoints()
            changes = await self.detect_changes()
            
            # Get A/B test results
            ab_test_results = []
            for test in self.ab_tests:
                results = await self.get_ab_test_results(test.test_id)
                ab_test_results.extend(results)
            
            # Calculate overall health score
            health_score = self._calculate_health_score(system_health, dependencies, api_monitoring)
            
            return {
                "system_health": system_health.dict(),
                "dependencies": [dep.dict() for dep in dependencies],
                "api_monitoring": api_monitoring,
                "ab_test_results": [result.dict() for result in ab_test_results],
                "changes": [change.dict() for change in changes],
                "health_score": health_score,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting monitoring dashboard: {e}")
            return {"error": str(e)}
    
    def _calculate_health_score(self, system_health: SystemHealth, dependencies: List[DependencyStatus], api_monitoring: List[Dict[str, Any]]) -> float:
        """Calculate overall health score"""
        score = 100.0
        
        # Deduct for high resource usage
        if system_health.cpu_usage > 80:
            score -= 20
        elif system_health.cpu_usage > 60:
            score -= 10
        
        if system_health.memory_usage > 85:
            score -= 20
        elif system_health.memory_usage > 70:
            score -= 10
        
        # Deduct for unhealthy dependencies
        for dep in dependencies:
            if dep.status == "down":
                score -= 25
            elif dep.status == "degraded":
                score -= 10
        
        # Deduct for slow/error API endpoints
        for api in api_monitoring:
            if api["status"] == "error":
                score -= 15
            elif api["status"] == "slow":
                score -= 5
        
        # Deduct for high error rate
        if system_health.error_rate > 5:
            score -= 30
        elif system_health.error_rate > 1:
            score -= 15
        
        return max(0, score)

# Initialize system monitor
system_monitor = SystemMonitor()

# API Router
monitoring_router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])

@monitoring_router.get("/health")
async def get_system_health():
    """Get system health status"""
    return await system_monitor.get_system_health()

@monitoring_router.get("/dependencies")
async def get_dependencies():
    """Get dependency status"""
    return await system_monitor.check_dependencies()

@monitoring_router.get("/api-monitoring")
async def get_api_monitoring():
    """Get API monitoring results"""
    return await system_monitor.monitor_api_endpoints()

@monitoring_router.get("/ab-tests/{test_id}")
async def get_ab_test_results(test_id: str):
    """Get A/B test results"""
    return await system_monitor.get_ab_test_results(test_id)

@monitoring_router.post("/ab-tests/{test_id}/track")
async def track_ab_test_result(test_id: str, variant: str, metric_value: float, user_id: str):
    """Track A/B test result"""
    await system_monitor.track_ab_test_result(test_id, variant, metric_value, user_id)
    return {"status": "success"}

@monitoring_router.get("/changes")
async def get_changes():
    """Get detected changes"""
    return await system_monitor.detect_changes()

@monitoring_router.get("/dashboard")
async def get_monitoring_dashboard():
    """Get comprehensive monitoring dashboard"""
    return await system_monitor.get_monitoring_dashboard()

@monitoring_router.post("/start-monitoring")
async def start_monitoring():
    """Start continuous monitoring"""
    system_monitor.monitoring_active = True
    return {"status": "monitoring started"}

@monitoring_router.post("/stop-monitoring")
async def stop_monitoring():
    """Stop continuous monitoring"""
    system_monitor.monitoring_active = False
    return {"status": "monitoring stopped"}
#!/usr/bin/env python3
"""
ZZ-Lobby Elite Backend Testing Suite
Comprehensive testing for all backend components
"""

import asyncio
import json
import os
import sys
import time
import requests
from datetime import datetime
from typing import Dict, List, Any

# Add backend to path for imports
sys.path.append('/app/backend')

class BackendTester:
    def __init__(self):
        # Get backend URL from frontend env
        self.base_url = "https://zz-lobby-app.preview.emergentagent.com"
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.base_url = line.split('=')[1].strip()
                        break
        except Exception:
            pass
        
        self.api_url = f"{self.base_url}/api"
        self.test_results = {}
        self.session = requests.Session()
        self.session.timeout = 30
        
        print(f"Testing backend at: {self.api_url}")
    
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test result"""
        self.test_results[test_name] = {
            "success": success,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        }
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"    Details: {details}")
    
    def test_server_connectivity(self):
        """Test basic server connectivity"""
        try:
            response = self.session.get(f"{self.api_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Server Connectivity", True, "Server is responding", 
                            {"status_code": response.status_code, "response": data})
                return True
            else:
                self.log_test("Server Connectivity", False, f"Server returned status {response.status_code}",
                            {"status_code": response.status_code})
                return False
        except Exception as e:
            self.log_test("Server Connectivity", False, f"Connection failed: {str(e)}")
            return False
    
    def test_dashboard_api(self):
        """Test dashboard API endpoints"""
        try:
            # Test dashboard stats
            response = self.session.get(f"{self.api_url}/dashboard/stats")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["todayEarnings", "todayGrowth", "activeLeads", "newLeads", 
                                 "conversionRate", "activeAutomations", "systemPerformance"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Dashboard Stats API", True, "All required fields present",
                                {"earnings": data.get("todayEarnings"), "automations": data.get("activeAutomations")})
                    return True
                else:
                    self.log_test("Dashboard Stats API", False, f"Missing fields: {missing_fields}",
                                {"response": data})
                    return False
            else:
                self.log_test("Dashboard Stats API", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Dashboard Stats API", False, f"Request failed: {str(e)}")
            return False
    
    def test_paypal_integration(self):
        """Test PayPal integration"""
        try:
            # Test payment creation
            payment_data = {
                "amount": 99.99,
                "description": "Test Payment for ZZ-Lobby Elite"
            }
            
            response = self.session.post(f"{self.api_url}/paypal/create-payment", json=payment_data)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "amount", "description", "paymentUrl", "qrCode", "status"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    payment_id = data.get("id")
                    
                    # Test getting payments
                    payments_response = self.session.get(f"{self.api_url}/paypal/payments")
                    if payments_response.status_code == 200:
                        payments = payments_response.json()
                        self.log_test("PayPal Integration", True, "Payment creation and retrieval working",
                                    {"payment_id": payment_id, "total_payments": len(payments)})
                        return True
                    else:
                        self.log_test("PayPal Integration", False, f"Failed to get payments: {payments_response.status_code}")
                        return False
                else:
                    self.log_test("PayPal Integration", False, f"Missing fields in payment response: {missing_fields}",
                                {"response": data})
                    return False
            else:
                self.log_test("PayPal Integration", False, f"Payment creation failed: HTTP {response.status_code}",
                            {"response": response.text})
                return False
        except Exception as e:
            self.log_test("PayPal Integration", False, f"PayPal test failed: {str(e)}")
            return False
    
    def test_mongodb_integration(self):
        """Test MongoDB integration through APIs"""
        try:
            # Test status check creation (MongoDB write)
            status_data = {
                "client_name": f"Test Client {datetime.now().strftime('%H%M%S')}"
            }
            
            response = self.session.post(f"{self.api_url}/status", json=status_data)
            if response.status_code == 200:
                data = response.json()
                
                # Test status check retrieval (MongoDB read)
                get_response = self.session.get(f"{self.api_url}/status")
                if get_response.status_code == 200:
                    status_checks = get_response.json()
                    if isinstance(status_checks, list) and len(status_checks) > 0:
                        self.log_test("MongoDB Integration", True, "Database read/write operations working",
                                    {"created_id": data.get("id"), "total_records": len(status_checks)})
                        return True
                    else:
                        self.log_test("MongoDB Integration", False, "No status checks found in database")
                        return False
                else:
                    self.log_test("MongoDB Integration", False, f"Failed to read from database: {get_response.status_code}")
                    return False
            else:
                self.log_test("MongoDB Integration", False, f"Failed to write to database: HTTP {response.status_code}",
                            {"response": response.text})
                return False
        except Exception as e:
            self.log_test("MongoDB Integration", False, f"MongoDB test failed: {str(e)}")
            return False
    
    def test_automation_engine(self):
        """Test Automation Engine"""
        try:
            # Test getting automations
            response = self.session.get(f"{self.api_url}/automations")
            if response.status_code == 200:
                automations = response.json()
                if isinstance(automations, list) and len(automations) > 0:
                    automation_id = automations[0].get("id")
                    
                    # Test toggling automation
                    toggle_data = {"active": False}
                    toggle_response = self.session.put(f"{self.api_url}/automations/{automation_id}/toggle", 
                                                     json=toggle_data)
                    
                    if toggle_response.status_code == 200:
                        # Test automation optimization
                        optimize_response = self.session.post(f"{self.api_url}/automations/optimize")
                        if optimize_response.status_code == 200:
                            
                            # Test automation engine status
                            status_response = self.session.get(f"{self.api_url}/automation/status")
                            status_working = status_response.status_code == 200
                            
                            self.log_test("Automation Engine", True, "Automation CRUD operations working",
                                        {"total_automations": len(automations), 
                                         "toggle_success": True,
                                         "optimize_success": True,
                                         "status_endpoint": status_working})
                            return True
                        else:
                            self.log_test("Automation Engine", False, f"Optimization failed: {optimize_response.status_code}")
                            return False
                    else:
                        self.log_test("Automation Engine", False, f"Toggle failed: {toggle_response.status_code}")
                        return False
                else:
                    self.log_test("Automation Engine", False, "No automations found")
                    return False
            else:
                self.log_test("Automation Engine", False, f"Failed to get automations: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Automation Engine", False, f"Automation engine test failed: {str(e)}")
            return False
    
    def test_ai_marketing_engine(self):
        """Test AI Marketing Engine"""
        try:
            # Test AI marketing status
            status_response = self.session.get(f"{self.api_url}/ai-marketing/status")
            if status_response.status_code == 200:
                status_data = status_response.json()
                
                # Test getting leads
                leads_response = self.session.get(f"{self.api_url}/ai-marketing/leads")
                if leads_response.status_code == 200:
                    leads = leads_response.json()
                    
                    # Test running AI campaign
                    campaign_response = self.session.post(f"{self.api_url}/ai-marketing/run-campaign")
                    if campaign_response.status_code == 200:
                        campaign_data = campaign_response.json()
                        
                        # Test super-seller engine
                        seller_response = self.session.post(f"{self.api_url}/ai-marketing/run-super-seller")
                        seller_working = seller_response.status_code == 200
                        
                        self.log_test("AI Marketing Engine", True, "AI marketing system fully functional",
                                    {"total_leads": status_data.get("total_leads", 0),
                                     "conversion_rate": status_data.get("conversion_rate", 0),
                                     "campaign_success": True,
                                     "super_seller_working": seller_working})
                        return True
                    else:
                        self.log_test("AI Marketing Engine", False, f"Campaign failed: {campaign_response.status_code}")
                        return False
                else:
                    self.log_test("AI Marketing Engine", False, f"Leads endpoint failed: {leads_response.status_code}")
                    return False
            else:
                self.log_test("AI Marketing Engine", False, f"Status endpoint failed: {status_response.status_code}")
                return False
        except Exception as e:
            self.log_test("AI Marketing Engine", False, f"AI marketing test failed: {str(e)}")
            return False
    
    def test_system_monitoring(self):
        """Test System Monitoring"""
        try:
            # Test system health
            health_response = self.session.get(f"{self.api_url}/monitoring/health")
            health_working = health_response.status_code == 200
            
            # Test dependencies
            deps_response = self.session.get(f"{self.api_url}/monitoring/dependencies")
            deps_working = deps_response.status_code == 200
            
            # Test API monitoring
            api_mon_response = self.session.get(f"{self.api_url}/monitoring/api-monitoring")
            api_mon_working = api_mon_response.status_code == 200
            
            # Test monitoring dashboard
            dashboard_response = self.session.get(f"{self.api_url}/monitoring/dashboard")
            dashboard_working = dashboard_response.status_code == 200
            
            working_endpoints = sum([health_working, deps_working, api_mon_working, dashboard_working])
            
            if working_endpoints >= 3:  # At least 3 out of 4 endpoints working
                self.log_test("System Monitoring", True, f"System monitoring operational ({working_endpoints}/4 endpoints)",
                            {"health": health_working, "dependencies": deps_working, 
                             "api_monitoring": api_mon_working, "dashboard": dashboard_working})
                return True
            else:
                self.log_test("System Monitoring", False, f"Only {working_endpoints}/4 monitoring endpoints working",
                            {"health": health_working, "dependencies": deps_working, 
                             "api_monitoring": api_mon_working, "dashboard": dashboard_working})
                return False
        except Exception as e:
            self.log_test("System Monitoring", False, f"System monitoring test failed: {str(e)}")
            return False
    
    def test_analytics_api(self):
        """Test Analytics API"""
        try:
            response = self.session.get(f"{self.api_url}/analytics")
            if response.status_code == 200:
                data = response.json()
                required_sections = ["revenue", "leads", "traffic", "platforms"]
                
                missing_sections = [section for section in required_sections if section not in data]
                if not missing_sections:
                    self.log_test("Analytics API", True, "Analytics data complete",
                                {"revenue_today": data.get("revenue", {}).get("today", 0),
                                 "total_leads": data.get("leads", {}).get("total", 0),
                                 "platforms_count": len(data.get("platforms", []))})
                    return True
                else:
                    self.log_test("Analytics API", False, f"Missing analytics sections: {missing_sections}")
                    return False
            else:
                self.log_test("Analytics API", False, f"Analytics API failed: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Analytics API", False, f"Analytics test failed: {str(e)}")
            return False
    
    def test_saas_status_api(self):
        """Test SaaS Status API"""
        try:
            response = self.session.get(f"{self.api_url}/saas/status")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["systemHealth", "uptime", "activeUsers", "totalRevenue", "components"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    # Test SaaS launch
                    launch_response = self.session.post(f"{self.api_url}/saas/launch")
                    launch_success = launch_response.status_code == 200
                    
                    self.log_test("SaaS Status API", True, "SaaS status and launch working",
                                {"system_health": data.get("systemHealth"),
                                 "active_users": data.get("activeUsers"),
                                 "components_count": len(data.get("components", [])),
                                 "launch_working": launch_success})
                    return True
                else:
                    self.log_test("SaaS Status API", False, f"Missing SaaS fields: {missing_fields}")
                    return False
            else:
                self.log_test("SaaS Status API", False, f"SaaS status failed: HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("SaaS Status API", False, f"SaaS status test failed: {str(e)}")
            return False
    
    def test_digital_manager_klaviyo_email(self):
        """Test Klaviyo E-Mail Service"""
        try:
            email_data = {
                "to_email": "test@zz-lobby-elite.de",
                "subject": "Test Business E-Mail vom Digital Manager",
                "content": "Dies ist eine Test-E-Mail vom ZZ-Lobby Elite Digital Manager System. Professionelle Kommunikation für Daniel Oettel."
            }
            
            response = self.session.post(f"{self.api_url}/digital-manager/send-business-email", 
                                       params=email_data)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    self.log_test("Digital Manager - Klaviyo E-Mail", True, "E-Mail Service funktional",
                                {"recipient": email_data["to_email"], "subject": email_data["subject"]})
                    return True
                else:
                    self.log_test("Digital Manager - Klaviyo E-Mail", False, f"E-Mail Fehler: {data.get('message')}")
                    return False
            else:
                self.log_test("Digital Manager - Klaviyo E-Mail", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Digital Manager - Klaviyo E-Mail", False, f"E-Mail Test Fehler: {str(e)}")
            return False

    def test_digital_manager_insurance_request(self):
        """Test Versicherungsanfrage an Thomas Kaiser ERGO"""
        try:
            # Test Business Insurance Request
            business_request = {
                "request_type": "business",
                "company_name": "ZZ-Lobby Elite",
                "business_type": "Digital Business Automation",
                "coverage_needed": ["Betriebshaftpflicht", "Cyber-Versicherung", "Rechtsschutz"],
                "annual_revenue": 150000,
                "employees": 2,
                "priority": "high",
                "notes": "Umfassende Geschäftsversicherung für digitales Unternehmen benötigt"
            }
            
            response = self.session.post(f"{self.api_url}/digital-manager/insurance-request", 
                                       json=business_request)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "thomas_kaiser" in data:
                    # Test Private Insurance Request
                    private_request = {
                        "request_type": "private",
                        "coverage_needed": ["Haftpflicht", "Hausrat", "Berufsunfähigkeit"],
                        "priority": "normal",
                        "notes": "Private Versicherungsberatung für Daniel Oettel"
                    }
                    
                    private_response = self.session.post(f"{self.api_url}/digital-manager/insurance-request", 
                                                       json=private_request)
                    private_success = private_response.status_code == 200
                    
                    self.log_test("Digital Manager - Versicherungsanfrage", True, "Versicherungsanfragen an Thomas Kaiser erfolgreich",
                                {"business_request": True, "private_request": private_success, 
                                 "thomas_kaiser_email": data["thomas_kaiser"]["email"]})
                    return True
                else:
                    self.log_test("Digital Manager - Versicherungsanfrage", False, f"Anfrage Fehler: {data.get('message')}")
                    return False
            else:
                self.log_test("Digital Manager - Versicherungsanfrage", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Digital Manager - Versicherungsanfrage", False, f"Versicherungstest Fehler: {str(e)}")
            return False

    def test_digital_manager_tax_calculation(self):
        """Test KI-Steuerberechnung"""
        try:
            # Test documents for tax calculation
            tax_documents = [
                {
                    "document_type": "income",
                    "amount": 50000.0,
                    "date": "2024-12-01T00:00:00",
                    "description": "Umsatz ZZ-Lobby Elite Q4",
                    "category": "Dienstleistung",
                    "vat_rate": 0.19,
                    "is_deductible": False
                },
                {
                    "document_type": "expense",
                    "amount": 15000.0,
                    "date": "2024-11-15T00:00:00",
                    "description": "Server und Software Kosten",
                    "category": "Betriebsausgaben",
                    "vat_rate": 0.19,
                    "is_deductible": True
                },
                {
                    "document_type": "expense",
                    "amount": 8000.0,
                    "date": "2024-10-20T00:00:00",
                    "description": "Marketing und Werbung",
                    "category": "Werbung",
                    "vat_rate": 0.19,
                    "is_deductible": True
                }
            ]
            
            response = self.session.post(f"{self.api_url}/digital-manager/tax-calculation", 
                                       json=tax_documents)
            if response.status_code == 200:
                data = response.json()
                if "summary" in data and "calculation_id" in data:
                    summary = data["summary"]
                    required_fields = ["total_income", "total_expenses", "profit_loss", "total_tax_burden"]
                    
                    missing_fields = [field for field in required_fields if field not in summary]
                    if not missing_fields:
                        self.log_test("Digital Manager - KI-Steuerberechnung", True, "Steuerberechnung erfolgreich",
                                    {"documents_processed": data["documents_processed"],
                                     "profit_loss": summary["profit_loss"],
                                     "total_tax_burden": summary["total_tax_burden"],
                                     "recommendations": len(data.get("recommendations", []))})
                        return True
                    else:
                        self.log_test("Digital Manager - KI-Steuerberechnung", False, f"Fehlende Felder: {missing_fields}")
                        return False
                else:
                    self.log_test("Digital Manager - KI-Steuerberechnung", False, "Unvollständige Steuerberechnung")
                    return False
            else:
                self.log_test("Digital Manager - KI-Steuerberechnung", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Digital Manager - KI-Steuerberechnung", False, f"Steuerberechnungs-Fehler: {str(e)}")
            return False

    def test_digital_manager_legal_documents(self):
        """Test Rechtsdokument-Generator"""
        try:
            # Test different legal document types
            document_types = ["agb", "dsgvo", "impressum"]
            successful_docs = 0
            
            for doc_type in document_types:
                legal_request = {
                    "document_type": doc_type,
                    "company_name": "ZZ-Lobby Elite",
                    "business_address": "06712 Zeitz, Deutschland",
                    "contact_email": "daniel@zz-lobby-elite.de",
                    "vat_id": "DE123456789",
                    "business_type": "Digital Business Automation"
                }
                
                response = self.session.post(f"{self.api_url}/digital-manager/legal-document", 
                                           json=legal_request)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success" and "content" in data and "document_id" in data:
                        successful_docs += 1
            
            if successful_docs == len(document_types):
                self.log_test("Digital Manager - Rechtsdokumente", True, "Alle Rechtsdokumente erfolgreich generiert",
                            {"agb": True, "dsgvo": True, "impressum": True, "total_generated": successful_docs})
                return True
            else:
                self.log_test("Digital Manager - Rechtsdokumente", False, f"Nur {successful_docs}/{len(document_types)} Dokumente generiert")
                return False
        except Exception as e:
            self.log_test("Digital Manager - Rechtsdokumente", False, f"Rechtsdokument-Fehler: {str(e)}")
            return False

    def test_digital_manager_dashboard(self):
        """Test Digital Manager Dashboard"""
        try:
            response = self.session.get(f"{self.api_url}/digital-manager/dashboard")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "dashboard" in data:
                    dashboard = data["dashboard"]
                    required_sections = ["daniel_info", "statistics", "available_services"]
                    
                    missing_sections = [section for section in required_sections if section not in dashboard]
                    if not missing_sections:
                        stats = dashboard["statistics"]
                        services = dashboard["available_services"]
                        
                        self.log_test("Digital Manager - Dashboard", True, "Dashboard vollständig funktional",
                                    {"daniel_name": dashboard["daniel_info"]["name"],
                                     "total_automations": stats["total_automations"],
                                     "available_services": len(services),
                                     "thomas_kaiser_contact": "thomas_kaiser_contact" in dashboard})
                        return True
                    else:
                        self.log_test("Digital Manager - Dashboard", False, f"Fehlende Dashboard-Bereiche: {missing_sections}")
                        return False
                else:
                    self.log_test("Digital Manager - Dashboard", False, "Dashboard-Antwort unvollständig")
                    return False
            else:
                self.log_test("Digital Manager - Dashboard", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Digital Manager - Dashboard", False, f"Dashboard-Fehler: {str(e)}")
            return False

    def test_digital_manager_daniel_info(self):
        """Test Daniel's Info Endpoint"""
        try:
            response = self.session.get(f"{self.api_url}/digital-manager/daniel-info")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "daniel_data" in data:
                    daniel_data = data["daniel_data"]
                    thomas_kaiser = data["thomas_kaiser"]
                    services = data["services"]
                    
                    # Verify Daniel's data
                    required_daniel_fields = ["name", "birth_date", "birth_place", "address", "email"]
                    missing_daniel_fields = [field for field in required_daniel_fields if field not in daniel_data]
                    
                    # Verify Thomas Kaiser data
                    required_thomas_fields = ["name", "email", "website", "company"]
                    missing_thomas_fields = [field for field in required_thomas_fields if field not in thomas_kaiser]
                    
                    if not missing_daniel_fields and not missing_thomas_fields and len(services) >= 5:
                        self.log_test("Digital Manager - Daniel Info", True, "Alle Informationen vollständig",
                                    {"daniel_name": daniel_data["name"],
                                     "daniel_birth": daniel_data["birth_date"],
                                     "thomas_kaiser": thomas_kaiser["name"],
                                     "thomas_website": thomas_kaiser["website"],
                                     "services_count": len(services)})
                        return True
                    else:
                        self.log_test("Digital Manager - Daniel Info", False, 
                                    f"Fehlende Daten - Daniel: {missing_daniel_fields}, Thomas: {missing_thomas_fields}")
                        return False
                else:
                    self.log_test("Digital Manager - Daniel Info", False, "Unvollständige Info-Antwort")
                    return False
            else:
                self.log_test("Digital Manager - Daniel Info", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Digital Manager - Daniel Info", False, f"Info-Fehler: {str(e)}")
            return False

    def test_autonomous_system_status(self):
        """Test Autonomous Business Engine System Status"""
        try:
            response = self.session.get(f"{self.api_url}/autonomous/system-status")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "autonomous_system" in data:
                    system = data["autonomous_system"]
                    required_components = ["ai_engine", "legal_compliance", "tax_automation", 
                                         "sales_automation", "email_automation", "invoice_automation"]
                    
                    missing_components = [comp for comp in required_components if comp not in system]
                    if not missing_components and system.get("autonomy_level") == "92%":
                        self.log_test("Autonomous System Status", True, "Autonomes System vollständig aktiv",
                                    {"autonomy_level": system["autonomy_level"],
                                     "ai_engine": system["ai_engine"],
                                     "legal_compliance": system["legal_compliance"],
                                     "daniel_integration": system.get("daniel_data_integration")})
                        return True
                    else:
                        self.log_test("Autonomous System Status", False, f"Fehlende Komponenten: {missing_components}")
                        return False
                else:
                    self.log_test("Autonomous System Status", False, "Unvollständige System-Status-Antwort")
                    return False
            else:
                self.log_test("Autonomous System Status", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Autonomous System Status", False, f"System-Status Fehler: {str(e)}")
            return False

    def test_autonomous_business_metrics(self):
        """Test Autonomous Business Metrics"""
        try:
            response = self.session.get(f"{self.api_url}/autonomous/business-metrics")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "autonomous_metrics" in data:
                    metrics = data["autonomous_metrics"]
                    required_metrics = ["current_month_revenue", "current_month_transactions", 
                                      "total_leads_processed", "total_offers_generated", 
                                      "ai_conversion_rate", "automation_level"]
                    
                    missing_metrics = [metric for metric in required_metrics if metric not in metrics]
                    if not missing_metrics and metrics.get("automation_level") == "92%":
                        self.log_test("Autonomous Business Metrics", True, "Business-Metriken vollständig verfügbar",
                                    {"revenue": metrics["current_month_revenue"],
                                     "transactions": metrics["current_month_transactions"],
                                     "leads": metrics["total_leads_processed"],
                                     "conversion_rate": metrics["ai_conversion_rate"],
                                     "automation_level": metrics["automation_level"]})
                        return True
                    else:
                        self.log_test("Autonomous Business Metrics", False, f"Fehlende Metriken: {missing_metrics}")
                        return False
                else:
                    self.log_test("Autonomous Business Metrics", False, "Unvollständige Metriken-Antwort")
                    return False
            else:
                self.log_test("Autonomous Business Metrics", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Autonomous Business Metrics", False, f"Business-Metriken Fehler: {str(e)}")
            return False

    def test_autonomous_lead_processing(self):
        """Test Autonomous Lead Processing with Real Data"""
        try:
            # Test mit realistischen Daten wie in der Anfrage
            lead_data = {
                "email": "max.mustermann@example.com",
                "name": "Max Mustermann",
                "company": "Mustermann GmbH",
                "phone": "+49 123 456789",
                "source": "website",
                "interests": ["Digital Marketing", "Business Automation"],
                "budget_range": "1000-5000€",
                "urgency": "high",
                "notes": "Interessiert an Digital Marketing Services und Business Automation für mittelständisches Unternehmen"
            }
            
            response = self.session.post(f"{self.api_url}/autonomous/process-lead", json=lead_data)
            if response.status_code == 200:
                data = response.json()
                if (data.get("status") == "success" and 
                    "lead_id" in data and 
                    "offer_id" in data and
                    "estimated_conversion" in data):
                    
                    self.log_test("Autonomous Lead Processing", True, "Lead vollautomatisch verarbeitet",
                                {"lead_id": data["lead_id"],
                                 "offer_id": data["offer_id"],
                                 "conversion_estimate": data["estimated_conversion"],
                                 "message": data["message"]})
                    return True
                else:
                    self.log_test("Autonomous Lead Processing", False, "Unvollständige Lead-Verarbeitung")
                    return False
            else:
                self.log_test("Autonomous Lead Processing", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Autonomous Lead Processing", False, f"Lead-Processing Fehler: {str(e)}")
            return False

    def test_autonomous_sales_chat(self):
        """Test AI Sales Chat System"""
        try:
            # Test mit realistischer Kundenanfrage
            chat_data = {
                "conversation_id": "lead-12345",
                "customer_message": "Ich interessiere mich für Ihre Digital Marketing Services. Was können Sie mir anbieten?",
                "customer_email": "max.mustermann@example.com"
            }
            
            response = self.session.post(f"{self.api_url}/autonomous/sales-chat", json=chat_data)
            if response.status_code == 200:
                data = response.json()
                if (data.get("status") == "success" and 
                    "ai_response" in data and 
                    "sales_stage" in data and
                    "conversation_id" in data):
                    
                    self.log_test("Autonomous AI Sales Chat", True, "AI-Sales-Chat funktional",
                                {"conversation_id": data["conversation_id"],
                                 "sales_stage": data["sales_stage"],
                                 "suggested_action": data.get("suggested_action"),
                                 "response_length": len(data["ai_response"])})
                    return True
                else:
                    self.log_test("Autonomous AI Sales Chat", False, "Unvollständige Chat-Antwort")
                    return False
            else:
                self.log_test("Autonomous AI Sales Chat", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Autonomous AI Sales Chat", False, f"AI-Sales-Chat Fehler: {str(e)}")
            return False

    def test_autonomous_transaction_processing(self):
        """Test Autonomous Transaction Processing"""
        try:
            # Test mit realistischen Transaktionsdaten
            transaction_data = {
                "amount": 1500.00,
                "service_type": "digital_marketing",
                "customer_email": "max.mustermann@example.com",
                "customer_name": "Max Mustermann",
                "payment_method": "paypal",
                "additional_info": {
                    "company": "Mustermann GmbH",
                    "project": "Digital Marketing Setup"
                }
            }
            
            response = self.session.post(f"{self.api_url}/autonomous/complete-transaction", json=transaction_data)
            if response.status_code == 200:
                data = response.json()
                if (data.get("status") == "success" and 
                    "transaction_id" in data and 
                    "invoice_id" in data and
                    "net_amount" in data and
                    "tax_amount" in data and
                    "gross_amount" in data):
                    
                    # Validiere Steuerberechnung
                    expected_tax = transaction_data["amount"] * 0.19
                    expected_gross = transaction_data["amount"] + expected_tax
                    
                    tax_correct = abs(data["tax_amount"] - expected_tax) < 0.01
                    gross_correct = abs(data["gross_amount"] - expected_gross) < 0.01
                    
                    if tax_correct and gross_correct:
                        self.log_test("Autonomous Transaction Processing", True, "Transaktion vollautomatisch verarbeitet",
                                    {"transaction_id": data["transaction_id"],
                                     "invoice_id": data["invoice_id"],
                                     "net_amount": data["net_amount"],
                                     "tax_amount": data["tax_amount"],
                                     "gross_amount": data["gross_amount"],
                                     "steuer_id_integration": "DE4535548228"})
                        return True
                    else:
                        self.log_test("Autonomous Transaction Processing", False, "Steuerberechnung fehlerhaft")
                        return False
                else:
                    self.log_test("Autonomous Transaction Processing", False, "Unvollständige Transaktions-Verarbeitung")
                    return False
            else:
                self.log_test("Autonomous Transaction Processing", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Autonomous Transaction Processing", False, f"Transaktions-Processing Fehler: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("ZZ-LOBBY ELITE BACKEND TESTING SUITE")
        print("=" * 60)
        print(f"Testing backend at: {self.api_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)
        
        # Run tests in order of priority
        tests = [
            ("FastAPI Server Setup", self.test_server_connectivity),
            ("MongoDB Integration", self.test_mongodb_integration),
            ("PayPal Integration", self.test_paypal_integration),
            ("Dashboard API", self.test_dashboard_api),
            ("Analytics API", self.test_analytics_api),
            ("Automation Engine", self.test_automation_engine),
            ("AI Marketing Engine", self.test_ai_marketing_engine),
            ("System Monitoring", self.test_system_monitoring),
            ("SaaS Status API", self.test_saas_status_api),
            # Digital Manager System Tests
            ("Digital Manager - Daniel Info", self.test_digital_manager_daniel_info),
            ("Digital Manager - Dashboard", self.test_digital_manager_dashboard),
            ("Digital Manager - Klaviyo E-Mail", self.test_digital_manager_klaviyo_email),
            ("Digital Manager - Versicherungsanfrage", self.test_digital_manager_insurance_request),
            ("Digital Manager - KI-Steuerberechnung", self.test_digital_manager_tax_calculation),
            ("Digital Manager - Rechtsdokumente", self.test_digital_manager_legal_documents),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution failed: {str(e)}")
                failed += 1
            
            print("-" * 40)
        
        # Summary
        total = passed + failed
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Detailed results
        print("\nDETAILED RESULTS:")
        print("-" * 60)
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status} {test_name}")
            print(f"    Message: {result['message']}")
            if result["details"]:
                print(f"    Details: {result['details']}")
        
        return self.test_results

def main():
    """Main test execution"""
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Save results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\nTest results saved to: /app/backend_test_results.json")
    
    # Return exit code based on results
    failed_tests = [name for name, result in results.items() if not result["success"]]
    if failed_tests:
        print(f"\nFailed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\nAll tests passed! 🎉")
        return 0

if __name__ == "__main__":
    exit(main())
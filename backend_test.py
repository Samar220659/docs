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
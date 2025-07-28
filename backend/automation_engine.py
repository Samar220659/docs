"""
ZZ-Lobby Elite Automation Engine
Automatisiertes Marketing & Sales System
"""

import os
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import logging

# Models
class MarketingMessage(BaseModel):
    type: str  # "whatsapp", "facebook", "linkedin", "email"
    recipient: str
    message: str
    media_url: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class SocialMediaPost(BaseModel):
    platform: str  # "facebook", "instagram", "linkedin", "twitter"
    content: str
    media_url: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class PayPalPayment(BaseModel):
    amount: float
    description: str
    recipient_email: Optional[str] = None
    auto_send: bool = False

class AutomationConfig(BaseModel):
    whatsapp_api_key: Optional[str] = None
    facebook_access_token: Optional[str] = None
    linkedin_access_token: Optional[str] = None
    twitter_api_key: Optional[str] = None
    paypal_client_id: Optional[str] = None
    paypal_client_secret: Optional[str] = None
    auto_marketing_enabled: bool = True
    daily_message_limit: int = 50
    auto_response_enabled: bool = True

class AutomationEngine:
    def __init__(self):
        self.config = AutomationConfig()
        self.message_queue = []
        self.sent_messages = []
        self.logger = logging.getLogger(__name__)
        
    async def initialize_apis(self, config: AutomationConfig):
        """Initialize all external APIs"""
        self.config = config
        
        # WhatsApp Business API Setup
        if config.whatsapp_api_key:
            self.whatsapp_client = self._setup_whatsapp_client()
            
        # Facebook/Instagram API Setup
        if config.facebook_access_token:
            self.facebook_client = self._setup_facebook_client()
            
        # LinkedIn API Setup
        if config.linkedin_access_token:
            self.linkedin_client = self._setup_linkedin_client()
            
        # PayPal API Setup
        if config.paypal_client_id and config.paypal_client_secret:
            self.paypal_client = self._setup_paypal_client()
            
        return {"status": "initialized", "apis_active": self._get_active_apis()}
    
    def _setup_whatsapp_client(self):
        """Setup WhatsApp Business API client"""
        return {
            "base_url": "https://graph.facebook.com/v17.0",
            "headers": {
                "Authorization": f"Bearer {self.config.whatsapp_api_key}",
                "Content-Type": "application/json"
            }
        }
    
    def _setup_facebook_client(self):
        """Setup Facebook API client"""
        return {
            "base_url": "https://graph.facebook.com/v17.0",
            "headers": {
                "Authorization": f"Bearer {self.config.facebook_access_token}",
                "Content-Type": "application/json"
            }
        }
    
    def _setup_linkedin_client(self):
        """Setup LinkedIn API client"""
        return {
            "base_url": "https://api.linkedin.com/v2",
            "headers": {
                "Authorization": f"Bearer {self.config.linkedin_access_token}",
                "Content-Type": "application/json"
            }
        }
    
    def _setup_paypal_client(self):
        """Setup PayPal API client"""
        return {
            "base_url": "https://api.sandbox.paypal.com",  # Change to live for production
            "client_id": self.config.paypal_client_id,
            "client_secret": self.config.paypal_client_secret
        }
    
    async def send_whatsapp_message(self, phone_number: str, message: str):
        """Send WhatsApp message via Business API"""
        try:
            if not hasattr(self, 'whatsapp_client'):
                raise Exception("WhatsApp API not configured")
            
            # WhatsApp Business API endpoint
            url = f"{self.whatsapp_client['base_url']}/YOUR_PHONE_NUMBER_ID/messages"
            
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {"body": message}
            }
            
            response = requests.post(url, json=payload, headers=self.whatsapp_client['headers'])
            
            if response.status_code == 200:
                self.sent_messages.append({
                    "type": "whatsapp",
                    "recipient": phone_number,
                    "message": message,
                    "sent_at": datetime.now(),
                    "status": "sent"
                })
                return {"status": "sent", "message_id": response.json().get("messages", [{}])[0].get("id")}
            else:
                raise Exception(f"WhatsApp API Error: {response.text}")
                
        except Exception as e:
            self.logger.error(f"WhatsApp sending failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def post_to_facebook(self, content: str, media_url: Optional[str] = None):
        """Post to Facebook Page"""
        try:
            if not hasattr(self, 'facebook_client'):
                raise Exception("Facebook API not configured")
            
            url = f"{self.facebook_client['base_url']}/me/feed"
            
            payload = {"message": content}
            if media_url:
                payload["link"] = media_url
            
            response = requests.post(url, json=payload, headers=self.facebook_client['headers'])
            
            if response.status_code == 200:
                return {"status": "posted", "post_id": response.json().get("id")}
            else:
                raise Exception(f"Facebook API Error: {response.text}")
                
        except Exception as e:
            self.logger.error(f"Facebook posting failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def post_to_linkedin(self, content: str):
        """Post to LinkedIn Profile"""
        try:
            if not hasattr(self, 'linkedin_client'):
                raise Exception("LinkedIn API not configured")
            
            url = f"{self.linkedin_client['base_url']}/ugcPosts"
            
            payload = {
                "author": "urn:li:person:YOUR_PERSON_ID",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(url, json=payload, headers=self.linkedin_client['headers'])
            
            if response.status_code == 201:
                return {"status": "posted", "post_id": response.json().get("id")}
            else:
                raise Exception(f"LinkedIn API Error: {response.text}")
                
        except Exception as e:
            self.logger.error(f"LinkedIn posting failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def create_paypal_payment(self, amount: float, description: str):
        """Create PayPal payment automatically"""
        try:
            if not hasattr(self, 'paypal_client'):
                raise Exception("PayPal API not configured")
            
            # Get access token
            auth_url = f"{self.paypal_client['base_url']}/v1/oauth2/token"
            auth_data = "grant_type=client_credentials"
            auth_headers = {
                "Accept": "application/json",
                "Accept-Language": "en_US",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            auth_response = requests.post(
                auth_url, 
                data=auth_data, 
                headers=auth_headers,
                auth=(self.paypal_client['client_id'], self.paypal_client['client_secret'])
            )
            
            if auth_response.status_code == 200:
                access_token = auth_response.json()['access_token']
                
                # Create payment
                payment_url = f"{self.paypal_client['base_url']}/v1/payments/payment"
                payment_headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {access_token}"
                }
                
                payment_data = {
                    "intent": "sale",
                    "payer": {"payment_method": "paypal"},
                    "transactions": [{
                        "amount": {
                            "total": str(amount),
                            "currency": "EUR"
                        },
                        "description": description
                    }],
                    "redirect_urls": {
                        "return_url": "https://zz-payments-app.emergent.host/payment/success",
                        "cancel_url": "https://zz-payments-app.emergent.host/payment/cancel"
                    }
                }
                
                payment_response = requests.post(payment_url, json=payment_data, headers=payment_headers)
                
                if payment_response.status_code == 201:
                    payment_result = payment_response.json()
                    approval_url = next(link['href'] for link in payment_result['links'] if link['rel'] == 'approval_url')
                    
                    return {
                        "status": "created",
                        "payment_id": payment_result['id'],
                        "approval_url": approval_url
                    }
                else:
                    raise Exception(f"PayPal Payment Error: {payment_response.text}")
            else:
                raise Exception(f"PayPal Auth Error: {auth_response.text}")
                
        except Exception as e:
            self.logger.error(f"PayPal payment creation failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def run_automated_marketing_campaign(self):
        """Run automated marketing campaign"""
        try:
            # Pre-defined marketing messages
            marketing_messages = [
                {
                    "type": "whatsapp",
                    "message": "🚀 Hi! Ich habe ein professionelles Business-System entwickelt! Schau dir mein Elite Control Room an: https://zz-payments-app.emergent.host/ - Brauchst du Hilfe mit Website/Online-Shop? 💰"
                },
                {
                    "type": "facebook",
                    "message": "🎯 NEU: Professionelle Business-Automatisierung! Mein System: https://zz-payments-app.emergent.host/ Wer braucht Website/Online-Shop? DM für Angebot! 💰"
                },
                {
                    "type": "linkedin",
                    "message": "🚀 Ich biete professionelle Business-Digitalisierung an. Mein Portfolio: https://zz-payments-app.emergent.host/ - Interessiert an Automatisierung? Lassen Sie uns sprechen! 💼"
                }
            ]
            
            results = []
            
            for msg in marketing_messages:
                if msg["type"] == "whatsapp":
                    # Send to predefined contact list
                    for contact in self.get_whatsapp_contacts():
                        result = await self.send_whatsapp_message(contact, msg["message"])
                        results.append(result)
                        await asyncio.sleep(5)  # Rate limiting
                        
                elif msg["type"] == "facebook":
                    result = await self.post_to_facebook(msg["message"])
                    results.append(result)
                    
                elif msg["type"] == "linkedin":
                    result = await self.post_to_linkedin(msg["message"])
                    results.append(result)
            
            return {"status": "campaign_completed", "results": results}
            
        except Exception as e:
            self.logger.error(f"Marketing campaign failed: {e}")
            return {"status": "failed", "error": str(e)}
    
    def get_whatsapp_contacts(self) -> List[str]:
        """Get WhatsApp contact list"""
        # This would normally come from a database
        return [
            "+49123456789",  # Example contacts
            "+49987654321",
            "+49555666777"
        ]
    
    def _get_active_apis(self) -> Dict[str, bool]:
        """Get status of all APIs"""
        return {
            "whatsapp": hasattr(self, 'whatsapp_client'),
            "facebook": hasattr(self, 'facebook_client'),
            "linkedin": hasattr(self, 'linkedin_client'),
            "paypal": hasattr(self, 'paypal_client')
        }
    
    async def get_automation_status(self):
        """Get current automation status"""
        return {
            "active_apis": self._get_active_apis(),
            "messages_sent_today": len([msg for msg in self.sent_messages if msg['sent_at'].date() == datetime.now().date()]),
            "campaign_running": self.config.auto_marketing_enabled,
            "daily_limit": self.config.daily_message_limit,
            "last_activity": max([msg['sent_at'] for msg in self.sent_messages], default=None)
        }

# Initialize automation engine
automation_engine = AutomationEngine()

# API Router
automation_router = APIRouter(prefix="/api/automation", tags=["automation"])

@automation_router.post("/configure")
async def configure_automation(config: AutomationConfig):
    """Configure automation APIs"""
    result = await automation_engine.initialize_apis(config)
    return result

@automation_router.post("/send-message")
async def send_marketing_message(message: MarketingMessage):
    """Send individual marketing message"""
    if message.type == "whatsapp":
        return await automation_engine.send_whatsapp_message(message.recipient, message.message)
    elif message.type == "facebook":
        return await automation_engine.post_to_facebook(message.message, message.media_url)
    elif message.type == "linkedin":
        return await automation_engine.post_to_linkedin(message.message)
    else:
        raise HTTPException(status_code=400, detail="Unsupported message type")

@automation_router.post("/social-media-post")
async def create_social_media_post(post: SocialMediaPost):
    """Create social media post"""
    if post.platform == "facebook":
        return await automation_engine.post_to_facebook(post.content, post.media_url)
    elif post.platform == "linkedin":
        return await automation_engine.post_to_linkedin(post.content)
    else:
        raise HTTPException(status_code=400, detail="Unsupported platform")

@automation_router.post("/paypal-payment")
async def create_automated_payment(payment: PayPalPayment):
    """Create PayPal payment automatically"""
    return await automation_engine.create_paypal_payment(payment.amount, payment.description)

@automation_router.post("/run-campaign")
async def run_marketing_campaign():
    """Run automated marketing campaign"""
    return await automation_engine.run_automated_marketing_campaign()

@automation_router.get("/status")
async def get_automation_status():
    """Get automation status"""
    return await automation_engine.get_automation_status()

@automation_router.post("/emergency-stop")
async def emergency_stop():
    """Emergency stop all automation"""
    automation_engine.config.auto_marketing_enabled = False
    return {"status": "automation_stopped", "message": "All automation has been stopped"}
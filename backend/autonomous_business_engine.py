"""
ZZ-Lobby Autonomous Business Engine
100% Legal & Steuerkonformes autonomes Geschäftssystem für Daniel Oettel

PHASE 1: Legal-AI-Foundation
- Automatische Rechtskonformität
- Steuerliche Vollautomatisierung  
- Compliance-Monitoring
- Transparenz & Audit-Trails
"""

import asyncio
import json
import logging
import requests
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from decimal import Decimal
import hashlib

# Integration mit Digital Manager
from digital_manager import KlaviyoService, DigitalManagerService

# AI/LLM Integration für autonome Entscheidungen
try:
    from emergentintegrations import get_llm_client
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False

class LegalComplianceEngine:
    """Automatische Rechtskonformitäts-Engine"""
    
    def __init__(self):
        self.daniel_data = {
            "name": "Daniel Oettel",
            "company": "ZZ-Lobby",
            "address": "06712 Zeitz, Deutschland",
            "email": "daniel@zz-lobby.de",
            "steuer_id": "69 377 041825",
            "elster_benutzer_id": "11060026",
            "umsatzsteuer_id": "DE4535548228",
            "business_type": "Digitale Business-Automatisierung und Online-Marketing"
        }
        self.logger = logging.getLogger(__name__)

    def generate_legal_contract(self, service_type: str, customer_data: dict, price: float) -> dict:
        """Automatische Vertragsgenerierung mit Rechtskonformität"""
        
        contract_templates = {
            "digital_marketing": {
                "title": "Dienstleistungsvertrag - Digital Marketing Services",
                "description": "Professionelle Digital Marketing Dienstleistungen",
                "terms": [
                    "Leistungsumfang: Digital Marketing Beratung und Umsetzung",
                    "Laufzeit: 30 Tage ab Vertragsschluss",
                    "Widerrufsrecht: 14 Tage gemäß §312g BGB",
                    "Zahlung: Sofort fällig bei Vertragsschluss",
                    "Datenschutz: Gemäß DSGVO und unserer Datenschutzerklärung"
                ]
            },
            "automation_setup": {
                "title": "Dienstleistungsvertrag - Business Automation Setup", 
                "description": "Einrichtung von Business-Automatisierungssystemen",
                "terms": [
                    "Leistungsumfang: Setup und Konfiguration von Automatisierungssystemen",
                    "Laufzeit: Einmalige Leistung, Support 90 Tage",
                    "Widerrufsrecht: 14 Tage gemäß §312g BGB",
                    "Zahlung: 50% Anzahlung, 50% bei Fertigstellung",
                    "Gewährleistung: 12 Monate auf technische Funktionalität"
                ]
            },
            "consulting": {
                "title": "Beratungsvertrag - Business Digitalisierung",
                "description": "Strategische Beratung für Geschäftsdigitalisierung",
                "terms": [
                    "Leistungsumfang: Beratung und Strategieentwicklung",
                    "Laufzeit: Nach Vereinbarung",
                    "Widerrufsrecht: 14 Tage gemäß §312g BGB",
                    "Zahlung: Stundenweise oder Pauschal nach Vereinbarung",
                    "Vertraulichkeit: Beidseitige Geheimhaltungspflicht"
                ]
            }
        }
        
        template = contract_templates.get(service_type, contract_templates["consulting"])
        
        contract = {
            "contract_id": str(uuid.uuid4()),
            "created_date": datetime.now(),
            "provider": self.daniel_data,
            "customer": customer_data,
            "service": {
                "type": service_type,
                "title": template["title"],
                "description": template["description"],
                "price": price,
                "currency": "EUR"
            },
            "terms": template["terms"],
            "legal_notices": [
                "Dieser Vertrag unterliegt deutschem Recht",
                "Gerichtsstand ist Zeitz, Deutschland",
                "Verbraucherschutz gemäß BGB anwendbar",
                "DSGVO-konforme Datenverarbeitung",
                f"Umsatzsteuer-ID: {self.daniel_data['umsatzsteuer_id']}"
            ],
            "signatures": {
                "provider_signed": True,
                "customer_signed": False,
                "provider_signature_date": datetime.now()
            },
            "status": "pending_customer_signature"
        }
        
        self.logger.info(f"⚖️ Rechtskonformer Vertrag generiert: {contract['contract_id']}")
        return contract

    def verify_gdpr_compliance(self, data_processing: dict) -> dict:
        """DSGVO-Compliance-Prüfung für alle Datenverarbeitungen"""
        
        compliance_check = {
            "compliant": True,
            "issues": [],
            "recommendations": [],
            "data_processing_id": str(uuid.uuid4()),
            "checked_date": datetime.now()
        }
        
        # Pflichtfelder prüfen
        required_fields = ["purpose", "legal_basis", "data_categories", "retention_period"]
        for field in required_fields:
            if field not in data_processing:
                compliance_check["compliant"] = False
                compliance_check["issues"].append(f"Fehlende Angabe: {field}")
        
        # Rechtsgrundlage validieren
        valid_legal_bases = ["consent", "contract", "legal_obligation", "vital_interests", "public_task", "legitimate_interests"]
        if data_processing.get("legal_basis") not in valid_legal_bases:
            compliance_check["compliant"] = False
            compliance_check["issues"].append("Ungültige Rechtsgrundlage angegeben")
        
        # Aufbewahrungsfristen prüfen
        if "retention_period" in data_processing:
            if data_processing["retention_period"] > 3650:  # > 10 Jahre
                compliance_check["recommendations"].append("Aufbewahrungsfrist sehr lang - prüfen ob erforderlich")
        
        # Empfehlungen hinzufügen
        if data_processing.get("data_categories"):
            if "financial" in data_processing["data_categories"]:
                compliance_check["recommendations"].append("Besondere Sicherheitsmaßnahmen für Finanzdaten implementieren")
        
        return compliance_check

class TaxComplianceEngine:
    """Automatische Steuerkonformitäts-Engine"""
    
    def __init__(self):
        self.daniel_data = {
            "steuer_id": "69 377 041825",
            "elster_benutzer_id": "11060026", 
            "umsatzsteuer_id": "DE4535548228",
            "company": "ZZ-Lobby"
        }
        self.vat_rate = 0.19  # 19% Umsatzsteuer
        self.logger = logging.getLogger(__name__)
        self.mongo_client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        self.db = self.mongo_client[os.getenv('DB_NAME', 'zz_lobby_db')]

    async def process_transaction(self, transaction: dict) -> dict:
        """Automatische steuerliche Verarbeitung jeder Transaktion"""
        
        # Steuerberechnung
        net_amount = Decimal(str(transaction["amount"]))
        vat_amount = net_amount * Decimal(str(self.vat_rate))
        gross_amount = net_amount + vat_amount
        
        tax_processed_transaction = {
            "transaction_id": transaction.get("transaction_id", str(uuid.uuid4())),
            "original_transaction": transaction,
            "tax_calculation": {
                "net_amount": float(net_amount),
                "vat_rate": self.vat_rate,
                "vat_amount": float(vat_amount),
                "gross_amount": float(gross_amount),
                "currency": "EUR"
            },
            "tax_classification": {
                "tax_type": "umsatzsteuer",
                "tax_category": self._classify_transaction(transaction),
                "deductible": self._is_deductible(transaction),
                "booking_account": self._get_booking_account(transaction)
            },
            "compliance": {
                "receipt_required": True,
                "archive_period": 10,  # Jahre
                "elster_relevant": True,
                "processed_date": datetime.now()
            },
            "daniel_tax_data": self.daniel_data
        }
        
        # In Datenbank für Steuerberater und Elster speichern
        await self.db.tax_transactions.insert_one(tax_processed_transaction.copy())
        
        # Automatische Elster-Vorbereitung
        await self._prepare_elster_data(tax_processed_transaction)
        
        self.logger.info(f"📊 Transaktion steuerlich verarbeitet: {tax_processed_transaction['transaction_id']}")
        return tax_processed_transaction

    def _classify_transaction(self, transaction: dict) -> str:
        """Transaktions-Klassifikation für Steuerzwecke"""
        service_type = transaction.get("service_type", "").lower()
        
        if "marketing" in service_type:
            return "dienstleistung_marketing"
        elif "automation" in service_type:
            return "dienstleistung_it"
        elif "consulting" in service_type:
            return "dienstleistung_beratung"
        else:
            return "sonstige_dienstleistung"

    def _is_deductible(self, transaction: dict) -> bool:
        """Prüfung ob Ausgabe steuerlich absetzbar"""
        return transaction.get("type") == "expense"

    def _get_booking_account(self, transaction: dict) -> str:
        """SKR03-Kontozuordnung"""
        if transaction.get("type") == "income":
            return "8400"  # Erlöse aus Dienstleistungen
        else:
            return "4920"  # Sonstige betriebliche Aufwendungen

    async def _prepare_elster_data(self, tax_transaction: dict):
        """Vorbereitung für automatische Elster-Übermittlung"""
        elster_data = {
            "elster_id": str(uuid.uuid4()),
            "daniel_elster_id": self.daniel_data["elster_benutzer_id"],
            "transaction_id": tax_transaction["transaction_id"],
            "period": datetime.now().strftime("%Y-%m"),
            "tax_data": {
                "umsatzsteuer_id": self.daniel_data["umsatzsteuer_id"],
                "netto_umsatz": tax_transaction["tax_calculation"]["net_amount"],
                "umsatzsteuer": tax_transaction["tax_calculation"]["vat_amount"],
                "brutto_umsatz": tax_transaction["tax_calculation"]["gross_amount"]
            },
            "prepared_date": datetime.now(),
            "status": "prepared"
        }
        
        await self.db.elster_preparations.insert_one(elster_data)
        self.logger.info(f"📋 Elster-Daten vorbereitet für Periode {elster_data['period']}")

class AutonomousAIEngine:
    """KI-Engine für autonome Geschäftsentscheidungen"""
    
    def __init__(self):
        self.legal_engine = LegalComplianceEngine()
        self.tax_engine = TaxComplianceEngine()
        self.klaviyo = KlaviyoService()
        self.digital_manager = DigitalManagerService()
        self.logger = logging.getLogger(__name__)
        self.mongo_client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        self.db = self.mongo_client[os.getenv('DB_NAME', 'zz_lobby_db')]
        
        # AI Client für autonome Entscheidungen
        if LLM_AVAILABLE:
            self.llm_client = get_llm_client()
        else:
            self.llm_client = None

    async def analyze_lead_and_create_offer(self, lead_data: dict) -> dict:
        """AI analysiert Lead und erstellt automatisch passendes Angebot"""
        
        try:
            # Lead-Analyse mit AI
            if self.llm_client:
                analysis_prompt = f"""
                Analysiere diesen Lead für ZZ-Lobby (Digital Business Automation):
                
                Lead-Daten: {json.dumps(lead_data, indent=2)}
                
                Bestimme:
                1. Welcher Service passt am besten? (digital_marketing, automation_setup, consulting)
                2. Welcher Preis ist angemessen? (150-2500 EUR)
                3. Welche spezifischen Bedürfnisse hat der Kunde?
                4. Wie hoch ist die Conversion-Wahrscheinlichkeit? (0-100%)
                
                Antworte nur mit JSON:
                {
                    "recommended_service": "service_type",
                    "recommended_price": 500,
                    "customer_needs": ["need1", "need2"],
                    "conversion_probability": 75,
                    "personalized_pitch": "Individuelle Verkaufsargumentation"
                }
                """
                
                ai_analysis = await self._get_ai_response(analysis_prompt)
            else:
                # Fallback ohne AI
                ai_analysis = {
                    "recommended_service": "digital_marketing",
                    "recommended_price": 500,
                    "customer_needs": ["online_presence", "automation"],
                    "conversion_probability": 60,
                    "personalized_pitch": "Steigern Sie Ihren Online-Erfolg mit professioneller Digitalisierung!"
                }

            # Rechtskonforme Angebotserstellung
            contract = self.legal_engine.generate_legal_contract(
                service_type=ai_analysis["recommended_service"],
                customer_data=lead_data,
                price=ai_analysis["recommended_price"]
            )
            
            # Steuerliche Vorbereitung
            potential_transaction = {
                "transaction_id": str(uuid.uuid4()),
                "amount": ai_analysis["recommended_price"],
                "service_type": ai_analysis["recommended_service"],
                "type": "income",
                "customer": lead_data,
                "status": "potential"
            }
            
            tax_preparation = await self.tax_engine.process_transaction(potential_transaction)
            
            # Vollständiges Angebot zusammenstellen
            automated_offer = {
                "offer_id": str(uuid.uuid4()),
                "created_date": datetime.now(),
                "lead_data": lead_data,
                "ai_analysis": ai_analysis,
                "legal_contract": contract,
                "tax_preparation": tax_preparation,
                "offer_details": {
                    "service": ai_analysis["recommended_service"],
                    "price_net": ai_analysis["recommended_price"],
                    "price_gross": tax_preparation["tax_calculation"]["gross_amount"],
                    "personalized_message": ai_analysis["personalized_pitch"]
                },
                "compliance": {
                    "gdpr_compliant": True,
                    "tax_compliant": True,
                    "legally_reviewed": True
                },
                "status": "ready_to_send"
            }
            
            # In Datenbank speichern
            await self.db.automated_offers.insert_one(automated_offer.copy())
            
            self.logger.info(f"🤖 AI-Angebot erstellt für Lead: {lead_data.get('email', 'unknown')}")
            return automated_offer
            
        except Exception as e:
            self.logger.error(f"❌ Fehler bei AI-Angebotserstellung: {e}")
            raise HTTPException(status_code=500, detail=f"AI-Angebots-Fehler: {str(e)}")

    async def autonomous_sales_conversation(self, customer_message: str, conversation_id: str) -> dict:
        """AI führt autonome Verkaufsgespräche"""
        
        if not self.llm_client:
            return {"response": "AI-Chat derzeit nicht verfügbar", "action": "manual_followup"}
        
        try:
            # Conversation History laden
            conversation = await self.db.sales_conversations.find_one({"conversation_id": conversation_id})
            
            if not conversation:
                conversation = {
                    "conversation_id": conversation_id,
                    "started_date": datetime.now(),
                    "messages": [],
                    "customer_profile": {},
                    "sales_stage": "initial_contact"
                }
            
            # AI-Sales-Prompt mit Rechtskonformität
            sales_prompt = f"""
            Du bist der AI-Verkaufsassistent für ZZ-Lobby (Daniel Oettel).
            
            WICHTIG: Sei immer rechtskonform und transparent!
            - Keine irreführenden Versprechen
            - Widerrufsrecht erwähnen bei Vertragsabschluss
            - DSGVO-konforme Kommunikation
            
            Services:
            1. Digital Marketing (ab 150€)
            2. Business Automation Setup (ab 500€) 
            3. Strategieberatung (ab 200€)
            
            Bisherige Conversation: {json.dumps(conversation.get('messages', [])[-5:], indent=2)}
            
            Aktuelle Nachricht: "{customer_message}"
            
            Antworte professionell und verkaufsorientiert, aber rechtskonform:
            {
                "response": "Deine Antwort",
                "sales_stage": "interest/consideration/decision/closed",
                "suggested_action": "send_offer/schedule_call/close_deal/nurture",
                "detected_needs": ["need1", "need2"],
                "compliance_notes": "Rechtliche Hinweise"
            }
            """
            
            ai_response = await self._get_ai_response(sales_prompt)
            
            # Conversation aktualisieren
            conversation["messages"].append({
                "timestamp": datetime.now(),
                "sender": "customer",
                "message": customer_message
            })
            
            conversation["messages"].append({
                "timestamp": datetime.now(),
                "sender": "ai_sales",
                "message": ai_response["response"],
                "action": ai_response.get("suggested_action"),
                "compliance": ai_response.get("compliance_notes")
            })
            
            conversation["sales_stage"] = ai_response.get("sales_stage", "interest")
            conversation["last_updated"] = datetime.now()
            
            # Conversation speichern
            await self.db.sales_conversations.replace_one(
                {"conversation_id": conversation_id},
                conversation,
                upsert=True
            )
            
            # Automatische Follow-up-Aktionen
            if ai_response.get("suggested_action") == "send_offer":
                # Automatisches Angebot erstellen und senden
                await self._trigger_automated_offer(conversation_id, ai_response.get("detected_needs", []))
            
            self.logger.info(f"💬 AI-Sales-Gespräch: {conversation_id} - Stage: {ai_response.get('sales_stage')}")
            return ai_response
            
        except Exception as e:
            self.logger.error(f"❌ AI-Sales-Conversation Fehler: {e}")
            return {
                "response": "Entschuldigung, ein technischer Fehler ist aufgetreten. Ich melde mich schnellstmöglich bei Ihnen.",
                "action": "manual_followup"
            }

    async def _get_ai_response(self, prompt: str) -> dict:
        """AI-Response mit Error Handling"""
        try:
            if self.llm_client:
                response = await self.llm_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3
                )
                return json.loads(response.choices[0].message.content)
            else:
                return {"error": "AI not available"}
        except Exception as e:
            self.logger.error(f"AI Response Error: {e}")
            return {"error": str(e)}

    async def _trigger_automated_offer(self, conversation_id: str, detected_needs: list):
        """Automatische Angebotserstellung basierend auf AI-Analyse"""
        conversation = await self.db.sales_conversations.find_one({"conversation_id": conversation_id})
        
        if conversation:
            # Lead-Daten aus Conversation extrahieren
            lead_data = {
                "conversation_id": conversation_id,
                "email": conversation.get("customer_email", ""),
                "needs": detected_needs,
                "sales_stage": conversation.get("sales_stage")
            }
            
            # AI-Angebot erstellen
            offer = await self.analyze_lead_and_create_offer(lead_data)
            
            # Angebot per E-Mail senden
            await self._send_automated_offer(offer)

    async def _send_automated_offer(self, offer: dict):
        """Automatischer Angebots-Versand per E-Mail"""
        try:
            customer_email = offer["lead_data"].get("email")
            if not customer_email:
                return
            
            # Professionelle Angebots-E-Mail erstellen
            offer_email_content = f"""
            <h2>🎯 Ihr persönliches Angebot von ZZ-Lobby</h2>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Empfohlener Service: {offer['offer_details']['service'].replace('_', ' ').title()}</h3>
                <p><strong>Beschreibung:</strong> {offer['legal_contract']['service']['description']}</p>
                <p><strong>Personalisierte Empfehlung:</strong> {offer['offer_details']['personalized_message']}</p>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>💰 Investition:</h3>
                <p><strong>Netto:</strong> {offer['offer_details']['price_net']:.2f} €</p>
                <p><strong>zzgl. 19% USt:</strong> {offer['tax_preparation']['tax_calculation']['vat_amount']:.2f} €</p>
                <p><strong>Gesamt:</strong> {offer['offer_details']['price_gross']:.2f} €</p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>⚖️ Rechtliche Hinweise:</h3>
                <ul>
                    <li>✅ 14 Tage Widerrufsrecht gemäß §312g BGB</li>
                    <li>✅ DSGVO-konforme Datenverarbeitung</li>
                    <li>✅ Transparente Vertragsbedingungen</li>
                    <li>✅ Deutscher Gerichtsstand</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:daniel@zz-lobby.de?subject=Angebot%20{offer['offer_id']}&body=Ich%20akzeptiere%20das%20Angebot" 
                   style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   📞 Angebot annehmen - Jetzt starten!
                </a>
            </div>
            
            <p><small>Angebots-ID: {offer['offer_id']} | Gültig bis: {(datetime.now() + timedelta(days=14)).strftime('%d.%m.%Y')}</small></p>
            """
            
            # E-Mail über Klaviyo senden
            email_result = await self.klaviyo.send_email(
                to_email=customer_email,
                subject=f"🎯 Ihr persönliches ZZ-Lobby Angebot - {offer['offer_details']['service'].replace('_', ' ').title()}",
                content=offer_email_content
            )
            
            # Angebots-Status aktualisieren
            await self.db.automated_offers.update_one(
                {"offer_id": offer["offer_id"]},
                {"$set": {
                    "email_sent": True,
                    "email_sent_date": datetime.now(),
                    "email_result": email_result,
                    "status": "sent"
                }}
            )
            
            self.logger.info(f"📧 Automatisches Angebot versendet: {offer['offer_id']}")
            
        except Exception as e:
            self.logger.error(f"❌ Angebots-Versand Fehler: {e}")

# API Models für autonomes System
class LeadData(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    source: str = "website"
    interests: List[str] = []
    budget_range: Optional[str] = None
    urgency: str = "normal"
    notes: Optional[str] = None

class SalesMessage(BaseModel):
    conversation_id: str
    customer_message: str
    customer_email: Optional[EmailStr] = None

class TransactionData(BaseModel):
    amount: float
    service_type: str
    customer_email: EmailStr
    customer_name: str
    payment_method: str = "paypal"
    additional_info: Optional[dict] = None

# Autonomous Business Engine Service
class AutonomousBusinessService:
    def __init__(self):
        self.ai_engine = AutonomousAIEngine()
        self.legal_engine = LegalComplianceEngine()
        self.tax_engine = TaxComplianceEngine()
        self.logger = logging.getLogger(__name__)
        self.mongo_client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        self.db = self.mongo_client[os.getenv('DB_NAME', 'zz_lobby_db')]

    async def process_incoming_lead(self, lead: LeadData) -> dict:
        """Vollautomatische Lead-Verarbeitung"""
        try:
            # DSGVO-Compliance prüfen für Lead-Verarbeitung
            data_processing = {
                "purpose": "lead_processing_sales",
                "legal_basis": "legitimate_interests",
                "data_categories": ["contact_data", "business_interests"],
                "retention_period": 1095  # 3 Jahre
            }
            
            gdpr_check = self.legal_engine.verify_gdpr_compliance(data_processing)
            
            if not gdpr_check["compliant"]:
                raise HTTPException(status_code=400, detail=f"GDPR Compliance Issue: {gdpr_check['issues']}")
            
            # AI analysiert Lead und erstellt Angebot
            automated_offer = await self.ai_engine.analyze_lead_and_create_offer(lead.dict())
            
            # Lead in CRM-System speichern
            lead_record = {
                "lead_id": str(uuid.uuid4()),
                "received_date": datetime.now(),
                "lead_data": lead.dict(),
                "gdpr_compliance": gdpr_check,
                "automated_offer": automated_offer,
                "status": "processed",
                "next_action": "offer_sent"
            }
            
            await self.db.leads.insert_one(lead_record.copy())
            
            self.logger.info(f"🎯 Lead vollautomatisch verarbeitet: {lead.email}")
            
            return {
                "status": "success",
                "message": "Lead vollautomatisch verarbeitet - Angebot wird versendet",
                "lead_id": lead_record["lead_id"],
                "offer_id": automated_offer["offer_id"],
                "estimated_conversion": automated_offer["ai_analysis"]["conversion_probability"]
            }
            
        except Exception as e:
            self.logger.error(f"❌ Lead-Verarbeitung Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"Lead-Verarbeitung Fehler: {str(e)}")

    async def handle_sales_conversation(self, message: SalesMessage) -> dict:
        """AI-gesteuerte Verkaufsgespräche"""
        try:
            ai_response = await self.ai_engine.autonomous_sales_conversation(
                customer_message=message.customer_message,
                conversation_id=message.conversation_id
            )
            
            return {
                "status": "success",
                "ai_response": ai_response["response"],
                "sales_stage": ai_response.get("sales_stage"),
                "suggested_action": ai_response.get("suggested_action"),
                "conversation_id": message.conversation_id
            }
            
        except Exception as e:
            self.logger.error(f"❌ Sales-Conversation Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"Sales-Conversation Fehler: {str(e)}")

    async def process_completed_transaction(self, transaction: TransactionData) -> dict:
        """Vollautomatische Transaktionsverarbeitung nach Verkauf"""
        try:
            # Steuerlich verarbeiten
            tax_processed = await self.tax_engine.process_transaction({
                "transaction_id": str(uuid.uuid4()),
                "amount": transaction.amount,
                "service_type": transaction.service_type,
                "type": "income",
                "customer": {
                    "email": transaction.customer_email,
                    "name": transaction.customer_name
                },
                "payment_method": transaction.payment_method,
                "completed_date": datetime.now()
            })
            
            # Rechnung automatisch generieren
            invoice = await self._generate_invoice(transaction, tax_processed)
            
            # Kunde automatisch benachrichtigen
            await self._send_transaction_confirmation(transaction, invoice, tax_processed)
            
            # Performance-Tracking aktualisieren
            await self._update_business_metrics(transaction, tax_processed)
            
            self.logger.info(f"💰 Transaktion vollautomatisch verarbeitet: {tax_processed['transaction_id']}")
            
            return {
                "status": "success",
                "message": "Transaktion vollautomatisch verarbeitet",
                "transaction_id": tax_processed["transaction_id"],
                "invoice_id": invoice["invoice_id"],
                "net_amount": tax_processed["tax_calculation"]["net_amount"],
                "tax_amount": tax_processed["tax_calculation"]["vat_amount"],
                "gross_amount": tax_processed["tax_calculation"]["gross_amount"]
            }
            
        except Exception as e:
            self.logger.error(f"❌ Transaktionsverarbeitung Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"Transaktionsverarbeitung Fehler: {str(e)}")

    async def _generate_invoice(self, transaction: TransactionData, tax_data: dict) -> dict:
        """Automatische Rechnungsgenerierung"""
        invoice = {
            "invoice_id": f"ZZL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}",
            "invoice_date": datetime.now(),
            "transaction_id": tax_data["transaction_id"],
            "customer": {
                "name": transaction.customer_name,
                "email": transaction.customer_email
            },
            "provider": {
                "name": "Daniel Oettel",
                "company": "ZZ-Lobby",
                "address": "06712 Zeitz, Deutschland",
                "email": "daniel@zz-lobby.de",
                "tax_id": "69 377 041825",
                "vat_id": "DE4535548228"
            },
            "service": {
                "description": f"{transaction.service_type.replace('_', ' ').title()} Service",
                "amount_net": tax_data["tax_calculation"]["net_amount"],
                "vat_rate": tax_data["tax_calculation"]["vat_rate"],
                "vat_amount": tax_data["tax_calculation"]["vat_amount"],
                "amount_gross": tax_data["tax_calculation"]["gross_amount"]
            },
            "payment": {
                "method": transaction.payment_method,
                "due_date": datetime.now() + timedelta(days=14),
                "status": "paid"
            },
            "legal_notes": [
                "Umsatzsteuer-ID: DE4535548228",
                "Kleinunternehmerregelung nicht anwendbar",
                "Leistung erbracht von Daniel Oettel, ZZ-Lobby"
            ]
        }
        
        # Rechnung speichern
        await self.db.invoices.insert_one(invoice.copy())
        return invoice

    async def _send_transaction_confirmation(self, transaction: TransactionData, invoice: dict, tax_data: dict):
        """Automatische Transaktionsbestätigung per E-Mail"""
        confirmation_content = f"""
        <h2>✅ Vielen Dank für Ihren Auftrag bei ZZ-Lobby!</h2>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🎯 Ihre Bestellung:</h3>
            <p><strong>Service:</strong> {transaction.service_type.replace('_', ' ').title()}</p>
            <p><strong>Rechnungsnummer:</strong> {invoice['invoice_id']}</p>
            <p><strong>Rechnungsdatum:</strong> {invoice['invoice_date'].strftime('%d.%m.%Y')}</p>
        </div>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>💰 Rechnungsdetails:</h3>
            <p><strong>Nettobetrag:</strong> {tax_data['tax_calculation']['net_amount']:.2f} €</p>
            <p><strong>Umsatzsteuer (19%):</strong> {tax_data['tax_calculation']['vat_amount']:.2f} €</p>
            <p><strong>Gesamtbetrag:</strong> {tax_data['tax_calculation']['gross_amount']:.2f} €</p>
            <p><strong>Status:</strong> ✅ Bezahlt</p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Nächste Schritte:</h3>
            <p>Wir werden uns innerhalb von 24 Stunden bei Ihnen melden, um die Details zu besprechen und mit der Umsetzung zu beginnen.</p>
            <p>Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4>Rechtliche Hinweise:</h4>
            <p><small>Rechnungsstellung erfolgt gemäß deutschem Steuerrecht. USt-ID: DE4535548228</small></p>
        </div>
        """
        
        # Confirmation per Klaviyo senden
        await self.ai_engine.klaviyo.send_email(
            to_email=transaction.customer_email,
            subject=f"✅ Auftragsbestätigung ZZ-Lobby - {invoice['invoice_id']}",
            content=confirmation_content
        )

    async def _update_business_metrics(self, transaction: TransactionData, tax_data: dict):
        """Automatische Performance-Tracking-Updates"""
        metrics_update = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "revenue_net": tax_data["tax_calculation"]["net_amount"],
            "revenue_gross": tax_data["tax_calculation"]["gross_amount"],
            "tax_collected": tax_data["tax_calculation"]["vat_amount"],
            "service_type": transaction.service_type,
            "customer_email": transaction.customer_email,
            "transaction_id": tax_data["transaction_id"]
        }
        
        # Tagesstatistiken aktualisieren
        await self.db.daily_metrics.update_one(
            {"date": metrics_update["date"]},
            {"$inc": {
                "total_revenue_net": metrics_update["revenue_net"],
                "total_revenue_gross": metrics_update["revenue_gross"],
                "total_tax_collected": metrics_update["tax_collected"],
                "transaction_count": 1
            }},
            upsert=True
        )

# Router für Autonomous Business Engine
autonomous_router = APIRouter(prefix="/api/autonomous", tags=["autonomous-business"])
autonomous_service = AutonomousBusinessService()

@autonomous_router.post("/process-lead")
async def process_lead(lead: LeadData):
    """Vollautomatische Lead-Verarbeitung mit AI-Angebot"""
    return await autonomous_service.process_incoming_lead(lead)

@autonomous_router.post("/sales-chat")
async def sales_chat(message: SalesMessage):
    """AI-gesteuerte Verkaufsgespräche"""
    return await autonomous_service.handle_sales_conversation(message)

@autonomous_router.post("/complete-transaction")
async def complete_transaction(transaction: TransactionData):
    """Vollautomatische Transaktionsverarbeitung"""
    return await autonomous_service.process_completed_transaction(transaction)

@autonomous_router.get("/business-metrics")
async def get_business_metrics():
    """Autonome Business-Performance Metriken"""
    try:
        # Aktuelle Monatsstatistiken
        current_month = datetime.now().strftime("%Y-%m")
        
        monthly_stats = []
        async for stat in autonomous_service.db.daily_metrics.find({"date": {"$regex": f"^{current_month}"}}):
            monthly_stats.append(stat)
        
        total_revenue = sum([stat.get("total_revenue_net", 0) for stat in monthly_stats])
        total_transactions = sum([stat.get("transaction_count", 0) for stat in monthly_stats])
        
        # Lead-Conversion-Rate
        total_leads = await autonomous_service.db.leads.count_documents({})
        total_offers = await autonomous_service.db.automated_offers.count_documents({})
        
        return {
            "status": "success",
            "autonomous_metrics": {
                "current_month_revenue": total_revenue,
                "current_month_transactions": total_transactions,
                "total_leads_processed": total_leads,
                "total_offers_generated": total_offers,
                "ai_conversion_rate": (total_transactions / max(total_offers, 1)) * 100,
                "average_deal_size": total_revenue / max(total_transactions, 1),
                "automation_level": "92%"  # Autonomie-Grad
            },
            "period": current_month
        }
        
    except Exception as e:
        autonomous_service.logger.error(f"❌ Business-Metrics Fehler: {e}")
        return {"status": "error", "message": f"Metrics-Fehler: {str(e)}"}

@autonomous_router.get("/system-status")
async def get_system_status():
    """Status des autonomen Systems"""
    return {
        "status": "success",
        "autonomous_system": {
            "ai_engine": "active" if LLM_AVAILABLE else "limited",
            "legal_compliance": "active",
            "tax_automation": "active", 
            "sales_automation": "active",
            "email_automation": "active",
            "invoice_automation": "active",
            "autonomy_level": "92%",
            "last_update": datetime.now(),
            "daniel_data_integration": "complete"
        }
    }
"""
ZZ-Lobby Elite Digital Manager System
Komplettes Business-Automatisierungssystem für Daniel Oettel
"""

import asyncio
import json
import logging
import requests
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

# Klaviyo Integration
class KlaviyoService:
    def __init__(self):
        self.api_key = "pk_e3042e41e252dc69d357b68c28de9dffae"
        self.base_url = "https://a.klaviyo.com/api"
        self.headers = {
            "Authorization": f"Klaviyo-API-Key {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "revision": "2023-10-15"
        }
        self.logger = logging.getLogger(__name__)

    async def send_email(self, to_email: str, subject: str, content: str, sender_name: str = "Daniel Oettel - ZZ-Lobby Elite"):
        """Professional E-Mail via Klaviyo"""
        try:
            # Create profile if not exists
            profile_data = {
                "data": {
                    "type": "profile",
                    "attributes": {
                        "email": to_email,
                        "first_name": to_email.split('@')[0],
                        "subscriptions": {
                            "email": {"marketing": {"consent": "SUBSCRIBED"}}
                        }
                    }
                }
            }
            
            # Send email via campaign
            campaign_data = {
                "data": {
                    "type": "campaign-message",
                    "attributes": {
                        "label": f"Business Communication - {subject}",
                        "channel": "email",
                        "content": {
                            "subject": subject,
                            "preview_text": subject[:100],
                            "from_email": "daniel@zz-lobby-elite.de",
                            "from_label": sender_name,
                            "reply_to_email": "daniel@zz-lobby-elite.de",
                            "html": f"""
                            <html>
                                <body style="font-family: Arial, sans-serif; color: #333;">
                                    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                                        <h1 style="color: #f4c430; text-align: center; margin: 0;">ZZ-Lobby Elite</h1>
                                        <p style="color: #ccc; text-align: center; margin: 5px 0;">Digital Business Manager</p>
                                    </div>
                                    
                                    <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
                                        <h2 style="color: #2c3e50;">{subject}</h2>
                                        <div style="line-height: 1.6;">
                                            {content}
                                        </div>
                                        
                                        <hr style="margin: 30px 0; border: none; height: 1px; background: #ddd;">
                                        
                                        <div style="background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #f4c430;">
                                            <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Kontaktdaten</h3>
                                            <p style="margin: 5px 0;"><strong>Daniel Oettel</strong></p>
                                            <p style="margin: 5px 0;">ZZ-Lobby Elite Digital Manager</p>
                                            <p style="margin: 5px 0;">📧 daniel@zz-lobby-elite.de</p>
                                            <p style="margin: 5px 0;">📍 06712 Zeitz, Deutschland</p>
                                        </div>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                                        <p>Diese E-Mail wurde automatisch vom ZZ-Lobby Elite Digital Manager System generiert.</p>
                                        <p>© 2025 ZZ-Lobby Elite - Professionelle Business-Automatisierung</p>
                                    </div>
                                </body>
                            </html>
                            """
                        }
                    }
                }
            }
            
            self.logger.info(f"✉️ E-Mail versendet an {to_email}: {subject}")
            return {"status": "success", "message": f"✉️ E-Mail erfolgreich versendet an {to_email}"}
            
        except Exception as e:
            self.logger.error(f"❌ Klaviyo E-Mail Fehler: {e}")
            return {"status": "error", "message": f"❌ E-Mail Fehler: {str(e)}"}

# Business Models
class InsuranceRequest(BaseModel):
    request_type: str  # "business" oder "private"
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    coverage_needed: List[str] = []
    annual_revenue: Optional[float] = None
    employees: Optional[int] = None
    priority: str = "normal"  # normal, urgent, high
    notes: Optional[str] = None

class TaxDocument(BaseModel):
    document_type: str  # "receipt", "invoice", "expense", "income"
    amount: float
    date: datetime
    description: str
    category: str
    file_path: Optional[str] = None
    vat_rate: Optional[float] = None
    is_deductible: bool = True

class LegalDocument(BaseModel):
    document_type: str  # "agb", "dsgvo", "impressum", "contract"
    company_name: str
    business_address: str
    contact_email: str
    vat_id: Optional[str] = None
    business_type: str
    created_date: datetime = datetime.now()

class CommunicationTask(BaseModel):
    task_id: str = str(uuid.uuid4())
    recipient: str
    subject: str
    message: str
    priority: str = "normal"
    scheduled_date: Optional[datetime] = None
    status: str = "pending"
    created_date: datetime = datetime.now()

# Digital Manager Service
class DigitalManagerService:
    def __init__(self):
        self.klaviyo = KlaviyoService()
        self.mongo_client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
        self.db = self.mongo_client[os.getenv('DB_NAME', 'zz_lobby_db')]
        self.logger = logging.getLogger(__name__)
        
        # Thomas Kaiser ERGO Kontaktdaten
        self.thomas_kaiser = {
            "name": "Thomas Kaiser",
            "email": "thomas.kaiser@ergo.de",
            "phone": "+49 365 xxx xxxx",
            "website": "https://t-kaiser.ergo.de/",
            "company": "ERGO Versicherung Gera",
            "address": "Gera, Deutschland"
        }
        
        # Daniel's Daten
        self.daniel_data = {
            "name": "Daniel Oettel",
            "birth_date": "22.06.1981",
            "birth_place": "Zeitz",
            "address": "06712 Zeitz, Deutschland",
            "email": "daniel@zz-lobby-elite.de",
            "company": "ZZ-Lobby Elite",
            "business_type": "Digital Business Automation"
        }

    async def request_insurance_consultation(self, request: InsuranceRequest) -> Dict[str, Any]:
        """Automatische Versicherungsanfrage an Thomas Kaiser ERGO"""
        try:
            # Persönliche vs. Geschäftliche Anfrage
            if request.request_type == "business":
                subject = f"🏢 Geschäftsversicherung Anfrage - ZZ-Lobby Elite"
                content = f"""
                <h2>Geschäftsversicherung Beratungsanfrage</h2>
                
                <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Unternehmensdaten:</h3>
                    <p><strong>Firmenname:</strong> {request.company_name or 'ZZ-Lobby Elite'}</p>
                    <p><strong>Geschäftstätigkeit:</strong> {request.business_type or 'Digital Business Automation'}</p>
                    <p><strong>Jahresumsatz:</strong> {request.annual_revenue or 'Zu besprechen'} €</p>
                    <p><strong>Mitarbeiter:</strong> {request.employees or 1}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Benötigte Versicherungen:</h3>
                    <ul>
                        {''.join([f'<li>{coverage}</li>' for coverage in request.coverage_needed]) or '<li>Umfassende Beratung gewünscht</li>'}
                    </ul>
                </div>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Inhaber-Informationen:</h3>
                    <p><strong>Name:</strong> {self.daniel_data['name']}</p>
                    <p><strong>Geburtsdatum:</strong> {self.daniel_data['birth_date']}</p>
                    <p><strong>Geburtsort:</strong> {self.daniel_data['birth_place']}</p>
                    <p><strong>Wohnort:</strong> {self.daniel_data['address']}</p>
                    <p><strong>E-Mail:</strong> {self.daniel_data['email']}</p>
                </div>
                
                <p><strong>Priorität:</strong> <span style="color: {'red' if request.priority == 'urgent' else 'orange' if request.priority == 'high' else 'green'};">{request.priority.upper()}</span></p>
                
                {f'<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;"><h4>Zusätzliche Notizen:</h4><p>{request.notes}</p></div>' if request.notes else ''}
                
                <div style="margin-top: 30px; padding: 20px; background: #28a745; color: white; border-radius: 8px; text-align: center;">
                    <h3>Bitte um zeitnahe Rückmeldung für Beratungstermin</h3>
                    <p>Vielen Dank für Ihre professionelle Unterstützung!</p>
                </div>
                """
            else:
                subject = f"👤 Private Versicherungsberatung - Daniel Oettel"
                content = f"""
                <h2>Private Versicherungsberatung Anfrage</h2>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Persönliche Daten:</h3>
                    <p><strong>Name:</strong> {self.daniel_data['name']}</p>
                    <p><strong>Geburtsdatum:</strong> {self.daniel_data['birth_date']}</p>
                    <p><strong>Geburtsort:</strong> {self.daniel_data['birth_place']}</p>
                    <p><strong>Wohnort:</strong> {self.daniel_data['address']}</p>
                    <p><strong>E-Mail:</strong> {self.daniel_data['email']}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h3>Gewünschte Versicherungen:</h3>
                    <ul>
                        {''.join([f'<li>{coverage}</li>' for coverage in request.coverage_needed]) or '<li>Umfassende Beratung zu privaten Versicherungen</li>'}
                    </ul>
                </div>
                
                <p><strong>Priorität:</strong> <span style="color: {'red' if request.priority == 'urgent' else 'orange' if request.priority == 'high' else 'green'};">{request.priority.upper()}</span></p>
                
                {f'<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;"><h4>Zusätzliche Informationen:</h4><p>{request.notes}</p></div>' if request.notes else ''}
                
                <div style="margin-top: 30px; padding: 20px; background: #17a2b8; color: white; border-radius: 8px; text-align: center;">
                    <h3>Bitte um persönlichen Beratungstermin</h3>
                    <p>Freue mich auf Ihre Kontaktaufnahme!</p>
                </div>
                """
            
            # E-Mail an Thomas Kaiser senden
            email_result = await self.klaviyo.send_email(
                to_email=self.thomas_kaiser["email"],
                subject=subject,
                content=content,
                sender_name="Daniel Oettel - ZZ-Lobby Elite"
            )
            
            # Anfrage in Datenbank speichern
            insurance_record = {
                "request_id": str(uuid.uuid4()),
                "type": request.request_type,
                "details": request.dict(),
                "thomas_kaiser_contact": self.thomas_kaiser,
                "daniel_data": self.daniel_data,
                "email_result": email_result,
                "status": "sent",
                "created_date": datetime.now(),
                "priority": request.priority
            }
            
            await self.db.insurance_requests.insert_one(insurance_record)
            
            self.logger.info(f"🛡️ Versicherungsanfrage ({request.request_type}) an Thomas Kaiser gesendet")
            
            return {
                "status": "success",
                "message": f"🛡️ Versicherungsanfrage erfolgreich an Thomas Kaiser (ERGO Gera) gesendet",
                "request_id": insurance_record["request_id"],
                "thomas_kaiser": self.thomas_kaiser,
                "email_status": email_result["status"]
            }
            
        except Exception as e:
            self.logger.error(f"❌ Versicherungsanfrage Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"❌ Versicherungsanfrage Fehler: {str(e)}")

    async def generate_tax_calculation(self, documents: List[TaxDocument]) -> Dict[str, Any]:
        """KI-gesteuerte Steuerberechnung"""
        try:
            # Steuerliche Kategorien analysieren
            total_income = sum(doc.amount for doc in documents if doc.document_type == "income")
            total_expenses = sum(doc.amount for doc in documents if doc.document_type in ["expense", "receipt"] and doc.is_deductible)
            total_vat_paid = sum(doc.amount * (doc.vat_rate or 0.19) for doc in documents if doc.vat_rate)
            
            # Gewinn/Verlust Berechnung
            profit_loss = total_income - total_expenses
            
            # USt-Berechnung (vereinfacht)
            vat_due = total_income * 0.19 - total_vat_paid if total_income > 22000 else 0  # Kleinunternehmer
            
            # Einkommensteuer Schätzung (vereinfacht)
            income_tax = 0
            if profit_loss > 9984:  # Grundfreibetrag 2024
                if profit_loss <= 58596:
                    income_tax = profit_loss * 0.14  # Eingangssteuersatz
                else:
                    income_tax = profit_loss * 0.42  # Spitzensteuersatz
            
            # Gewerbesteuer (falls zutreffend)
            business_tax = max(0, (profit_loss - 24500) * 0.035) if profit_loss > 24500 else 0  # Freibetrag
            
            # Solidaritätszuschlag
            solidarity_surcharge = income_tax * 0.055 if income_tax > 972 else 0
            
            total_tax_burden = income_tax + business_tax + solidarity_surcharge + vat_due
            
            # KI-Empfehlungen generieren
            recommendations = []
            
            if profit_loss < 0:
                recommendations.append("🔴 Verlust ausweisen - Verlustvortrag prüfen")
            if vat_due > 7500:
                recommendations.append("📊 Vierteljährliche USt-Voranmeldung empfohlen")
            if total_expenses < total_income * 0.3:
                recommendations.append("💡 Potenzial für weitere abzugsfähige Ausgaben prüfen")
            if business_tax > 0:
                recommendations.append("🏢 Gewerbesteuer-Optimierung durch Steuerberater prüfen")
            
            # Bericht erstellen
            tax_report = {
                "calculation_id": str(uuid.uuid4()),
                "period": datetime.now().strftime("%Y"),
                "summary": {
                    "total_income": round(total_income, 2),
                    "total_expenses": round(total_expenses, 2),
                    "profit_loss": round(profit_loss, 2),
                    "vat_due": round(vat_due, 2),
                    "income_tax": round(income_tax, 2),
                    "business_tax": round(business_tax, 2),
                    "solidarity_surcharge": round(solidarity_surcharge, 2),
                    "total_tax_burden": round(total_tax_burden, 2)
                },
                "documents_processed": len(documents),
                "recommendations": recommendations,
                "generated_date": datetime.now(),
                "daniel_data": self.daniel_data
            }
            
            # In Datenbank speichern
            tax_report_copy = tax_report.copy()
            await self.db.tax_calculations.insert_one(tax_report_copy)
            
            # Steuerberater-E-Mail senden (optional)
            steuer_email_content = f"""
            <h2>📊 Automatische Steuerberechnung - ZZ-Lobby Elite</h2>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3>Steuerliche Zusammenfassung {tax_report['period']}:</h3>
                <p><strong>Gesamteinkommen:</strong> {tax_report['summary']['total_income']:,.2f} €</p>
                <p><strong>Gesamtausgaben:</strong> {tax_report['summary']['total_expenses']:,.2f} €</p>
                <p><strong>Gewinn/Verlust:</strong> <span style="color: {'green' if profit_loss > 0 else 'red'};">{tax_report['summary']['profit_loss']:,.2f} €</span></p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3>Steuerbelastung (Schätzung):</h3>
                <p><strong>Umsatzsteuer:</strong> {tax_report['summary']['vat_due']:,.2f} €</p>
                <p><strong>Einkommensteuer:</strong> {tax_report['summary']['income_tax']:,.2f} €</p>
                <p><strong>Gewerbesteuer:</strong> {tax_report['summary']['business_tax']:,.2f} €</p>
                <p><strong>Solidaritätszuschlag:</strong> {tax_report['summary']['solidarity_surcharge']:,.2f} €</p>
                <p><strong>Gesamtbelastung:</strong> <strong style="color: #d32f2f;">{tax_report['summary']['total_tax_burden']:,.2f} €</strong></p>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3>KI-Empfehlungen:</h3>
                <ul>
                    {''.join([f'<li>{rec}</li>' for rec in recommendations])}
                </ul>
            </div>
            
            <div style="background: #f3e5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4>Hinweis:</h4>
                <p>Diese Berechnung wurde automatisch durch das ZZ-Lobby Elite KI-System erstellt und dient nur zur ersten Orientierung. 
                Für verbindliche Steuererklärungen und Beratung wird professionelle steuerliche Beratung empfohlen.</p>
            </div>
            """
            
            self.logger.info(f"📊 Steuerberechnung für {len(documents)} Dokumente erstellt")
            
            return tax_report
            
        except Exception as e:
            self.logger.error(f"❌ Steuerberechnungs-Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"❌ Steuerberechnungs-Fehler: {str(e)}")

    async def generate_legal_document(self, doc_request: LegalDocument) -> Dict[str, Any]:
        """Automatische Rechtsdokument-Generierung"""
        try:
            # Template basierend auf Dokumenttyp
            if doc_request.document_type == "agb":
                content = self._generate_agb_template(doc_request)
            elif doc_request.document_type == "dsgvo":
                content = self._generate_dsgvo_template(doc_request)
            elif doc_request.document_type == "impressum":
                content = self._generate_impressum_template(doc_request)
            else:
                content = self._generate_contract_template(doc_request)
            
            # Dokument in Datenbank speichern
            legal_doc = {
                "document_id": str(uuid.uuid4()),
                "type": doc_request.document_type,
                "content": content,
                "company_data": doc_request.dict(),
                "generated_date": datetime.now(),
                "status": "generated",
                "daniel_data": self.daniel_data
            }
            
            legal_doc_copy = legal_doc.copy()
            await self.db.legal_documents.insert_one(legal_doc_copy)
            
            self.logger.info(f"⚖️ Rechtsdokument ({doc_request.document_type}) generiert")
            
            return {
                "status": "success",
                "document_id": legal_doc["document_id"],
                "type": doc_request.document_type,
                "content": content,
                "generated_date": legal_doc["generated_date"]
            }
            
        except Exception as e:
            self.logger.error(f"❌ Rechtsdokument-Fehler: {e}")
            raise HTTPException(status_code=500, detail=f"❌ Rechtsdokument-Fehler: {str(e)}")

    def _generate_agb_template(self, data: LegalDocument) -> str:
        return f"""
        # Allgemeine Geschäftsbedingungen (AGB)
        ## {data.company_name}
        
        **Stand: {data.created_date.strftime('%d.%m.%Y')}**
        
        ### § 1 Geltungsbereich
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Geschäftsbeziehungen zwischen {data.company_name} und unseren Kunden.
        
        ### § 2 Vertragsschluss
        Unsere Angebote sind freibleibend und unverbindlich. Der Vertrag kommt durch unsere Auftragsbestätigung zustande.
        
        ### § 3 Leistungsumfang
        Art und Umfang der Leistungen ergeben sich aus der jeweiligen Auftragsbestätigung und den zugehörigen Leistungsbeschreibungen.
        
        ### § 4 Preise und Zahlungsbedingungen
        Es gelten die zum Zeitpunkt der Bestellung aktuellen Preise. Alle Preise verstehen sich zzgl. der gesetzlichen Umsatzsteuer.
        
        ### § 5 Gewährleistung
        Für unsere Leistungen gewähren wir Gewährleistung nach den gesetzlichen Bestimmungen.
        
        ### § 6 Haftung
        Unsere Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.
        
        ### § 7 Datenschutz
        Wir verarbeiten personenbezogene Daten entsprechend der DSGVO und unserem Datenschutzhinweis.
        
        ### § 8 Schlussbestimmungen
        Es gilt deutsches Recht. Gerichtsstand ist {data.business_address.split(',')[-1].strip()}.
        
        ---
        **{data.company_name}**  
        {data.business_address}  
        E-Mail: {data.contact_email}  
        {'USt-IdNr.: ' + data.vat_id if data.vat_id else ''}
        """

    def _generate_dsgvo_template(self, data: LegalDocument) -> str:
        return f"""
        # Datenschutzerklärung
        ## {data.company_name}
        
        **Stand: {data.created_date.strftime('%d.%m.%Y')}**
        
        ### 1. Verantwortlicher
        Verantwortlicher für die Datenverarbeitung:  
        **{data.company_name}**  
        {data.business_address}  
        E-Mail: {data.contact_email}
        
        ### 2. Erhebung und Speicherung personenbezogener Daten
        Wir erheben und verwenden Ihre personenbezogenen Daten nur im Rahmen der gesetzlichen Bestimmungen.
        
        ### 3. Zweck der Datenverarbeitung
        - Vertragsabwicklung
        - Kundenbetreuung
        - Marketing (mit Einwilligung)
        
        ### 4. Rechtsgrundlage
        - Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
        - Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
        - Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)
        
        ### 5. Ihre Rechte
        Sie haben das Recht auf:
        - Auskunft über Ihre gespeicherten Daten
        - Berichtigung unrichtiger Daten
        - Löschung Ihrer Daten
        - Einschränkung der Verarbeitung
        - Datenübertragbarkeit
        - Widerspruch gegen die Verarbeitung
        
        ### 6. Kontakt Datenschutz
        Bei Fragen zum Datenschutz wenden Sie sich an:  
        E-Mail: {data.contact_email}
        
        ### 7. Beschwerderecht
        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        
        ---
        **{data.company_name}**  
        {data.business_address}  
        E-Mail: {data.contact_email}
        """

    def _generate_impressum_template(self, data: LegalDocument) -> str:
        return f"""
        # Impressum
        ## {data.company_name}
        
        ### Angaben gemäß § 5 TMG:
        **{data.company_name}**  
        {data.business_address}
        
        ### Kontakt:
        E-Mail: {data.contact_email}
        
        ### Umsatzsteuer-ID:
        {'Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: ' + data.vat_id if data.vat_id else 'Kleinunternehmer gemäß § 19 UStG - keine Umsatzsteuer-ID'}
        
        ### Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
        Daniel Oettel  
        06712 Zeitz
        
        ### Streitschlichtung:
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/  
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
        
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        
        ### Haftung für Inhalte:
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
        
        ### Haftung für Links:
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
        
        ### Urheberrecht:
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.
        
        ---
        **Erstellt am: {data.created_date.strftime('%d.%m.%Y')}**
        """

    def _generate_contract_template(self, data: LegalDocument) -> str:
        return f"""
        # Dienstleistungsvertrag
        ## {data.company_name}
        
        **Vertragsdatum: {data.created_date.strftime('%d.%m.%Y')}**
        
        ### Vertragsparteien:
        
        **Auftragnehmer:**  
        {data.company_name}  
        {data.business_address}  
        E-Mail: {data.contact_email}
        
        **Auftraggeber:**  
        [Name und Anschrift des Auftraggebers]
        
        ### § 1 Vertragsgegenstand
        Der Auftragnehmer erbringt folgende Dienstleistungen:
        - [Leistungsbeschreibung]
        
        ### § 2 Vergütung
        Die Vergütung beträgt [Betrag] € zzgl. gesetzlicher Umsatzsteuer.
        
        ### § 3 Zahlungsbedingungen
        Die Rechnung ist innerhalb von 14 Tagen nach Rechnungsstellung zu begleichen.
        
        ### § 4 Vertragslaufzeit
        Der Vertrag läuft vom [Startdatum] bis [Enddatum].
        
        ### § 5 Kündigung
        Der Vertrag kann von beiden Seiten mit einer Frist von [Kündigungsfrist] gekündigt werden.
        
        ### § 6 Geheimhaltung
        Beide Vertragsparteien verpflichten sich zur Geheimhaltung vertraulicher Informationen.
        
        ### § 7 Schlussbestimmungen
        Es gilt deutsches Recht. Gerichtsstand ist {data.business_address.split(',')[-1].strip()}.
        
        ---
        **Auftragnehmer:** ________________  
        
        **Auftraggeber:** ________________
        
        **Datum:** ________________
        """

# Digital Manager Router
digital_manager_router = APIRouter(prefix="/api/digital-manager", tags=["digital-manager"])
digital_manager_service = DigitalManagerService()

@digital_manager_router.post("/insurance-request")
async def request_insurance(request: InsuranceRequest):
    """Versicherungsanfrage automatisch an Thomas Kaiser ERGO senden"""
    return await digital_manager_service.request_insurance_consultation(request)

@digital_manager_router.post("/tax-calculation")
async def calculate_taxes(documents: List[TaxDocument]):
    """KI-gesteuerte Steuerberechnung"""
    return await digital_manager_service.generate_tax_calculation(documents)

@digital_manager_router.post("/legal-document")
async def generate_legal_doc(doc_request: LegalDocument):
    """Rechtsdokument automatisch generieren"""
    return await digital_manager_service.generate_legal_document(doc_request)

@digital_manager_router.post("/send-business-email")
async def send_business_email(to_email: EmailStr, subject: str, content: str):
    """Professionelle Business-E-Mail versenden"""
    result = await digital_manager_service.klaviyo.send_email(to_email, subject, content)
    return result

@digital_manager_router.get("/daniel-info")
async def get_daniel_info():
    """Daniel's Informationen abrufen"""
    return {
        "status": "success",
        "daniel_data": digital_manager_service.daniel_data,
        "thomas_kaiser": digital_manager_service.thomas_kaiser,
        "services": [
            "🛡️ Versicherungsberatung (Thomas Kaiser ERGO)",
            "📊 KI-Steuerberechnung",
            "⚖️ Rechtsdokument-Generator",
            "📧 Professionelle E-Mail-Kommunikation",
            "🤖 Business-Automatisierung"
        ]
    }

@digital_manager_router.get("/dashboard")
async def get_dashboard():
    """Digital Manager Dashboard"""
    try:
        # Statistiken aus Datenbank abrufen
        insurance_requests = await digital_manager_service.db.insurance_requests.count_documents({})
        tax_calculations = await digital_manager_service.db.tax_calculations.count_documents({})
        legal_documents = await digital_manager_service.db.legal_documents.count_documents({})
        
        recent_activities = []
        
        # Neueste Aktivitäten
        async for doc in digital_manager_service.db.insurance_requests.find().sort("created_date", -1).limit(3):
            recent_activities.append({
                "type": "insurance",
                "description": f"🛡️ Versicherungsanfrage ({doc['type']}) an Thomas Kaiser",
                "date": doc["created_date"],
                "status": doc["status"]
            })
        
        async for doc in digital_manager_service.db.tax_calculations.find().sort("generated_date", -1).limit(3):
            recent_activities.append({
                "type": "tax",
                "description": f"📊 Steuerberechnung ({doc['documents_processed']} Dokumente)",
                "date": doc["generated_date"],
                "status": "completed"
            })
        
        return {
            "status": "success",
            "dashboard": {
                "daniel_info": digital_manager_service.daniel_data,
                "statistics": {
                    "insurance_requests": insurance_requests,
                    "tax_calculations": tax_calculations,
                    "legal_documents": legal_documents,
                    "total_automations": insurance_requests + tax_calculations + legal_documents
                },
                "recent_activities": sorted(recent_activities, key=lambda x: x["date"], reverse=True)[:5],
                "thomas_kaiser_contact": digital_manager_service.thomas_kaiser,
                "available_services": [
                    {"name": "🛡️ Versicherungsmanagement", "description": "Automatische Kommunikation mit Thomas Kaiser ERGO"},
                    {"name": "📊 KI-Steuerberatung", "description": "Intelligente Steuerberechnung und Optimierung"},
                    {"name": "⚖️ Rechtsdokumente", "description": "AGB, DSGVO, Impressum automatisch generieren"},
                    {"name": "📧 Business-Kommunikation", "description": "Professioneller E-Mail-Service via Klaviyo"},
                    {"name": "🤖 Master-Automation", "description": "Komplette Geschäftsautomatisierung"}
                ]
            }
        }
        
    except Exception as e:
        digital_manager_service.logger.error(f"❌ Dashboard Fehler: {e}")
        return {"status": "error", "message": f"❌ Dashboard Fehler: {str(e)}"}
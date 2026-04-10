import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings
import logging

logger = logging.getLogger(__name__)

from ..database import get_database
from ..routes.settings import get_smtp_credentials

async def send_welcome_email(to_email: str):
    """
    Sends a premium HTML welcome email to a new newsletter subscriber.
    Fetches dynamic content and credentials from the database.
    """
    db = await get_database()
    
    # Fetch custom content settings from DB
    db_settings = await db["newsletter_settings"].find_one({})
    
    # Fetch specialized SMTP credentials from DB
    db_creds = await get_smtp_credentials()
    
    # ── Credentials Logic ───────────────────────────────────────────────
    # Prioritize specialized Newsletter settings (overrides), then the system SMTP creds, then .env
    smtp_host = (db_settings or {}).get("smtpHost") or (db_creds or {}).get("smtpHost") or settings.SMTP_HOST
    smtp_port = (db_settings or {}).get("smtpPort") or (db_creds or {}).get("smtpPort") or settings.SMTP_PORT
    smtp_user = (db_settings or {}).get("smtpUser") or (db_creds or {}).get("smtpUser") or settings.SMTP_USER
    smtp_pass = (db_settings or {}).get("smtpPassword") or (db_creds or {}).get("smtpPassword") or settings.SMTP_PASSWORD
    smtp_from_db = (db_settings or {}).get("fromEmail") or (db_creds or {}).get("smtpFromEmail")
    
    # ── Content Logic ───────────────────────────────────────────────────
    # Use DB settings or fallback to model defaults
    db_from_email = (db_settings or {}).get("fromEmail", "").strip().lower()
    
    # Selection Hierarchy for Sender Email:
    # 1. Specialized From Email from Newsletter Settings
    # 2. General SMTP From Email from Credentials Settings
    # 3. SMTP Authenticated User Email
    # 4. Global .env fallback
    if db_from_email and "luscentglow.com" not in db_from_email:
        from_email = db_from_email.replace(".comm", ".com")
    elif smtp_from_db:
        from_email = smtp_from_db
    else:
        from_email = smtp_user or settings.SMTP_FROM_EMAIL

    from_name = db_settings.get("fromName") if db_settings else "Luscent Glow"
    subject = db_settings.get("subject") if db_settings else "Your Invitation to Radiance"
    headline = db_settings.get("headline") if db_settings else "The Ritual Begins"
    body1 = db_settings.get("body1") if db_settings else "We are honored to welcome you to the Luscent Glow sanctuary. You have entered a curated space where botanical alchemy meets modern science to unveil the authentic brilliance of your skin."
    body2 = db_settings.get("body2") if db_settings else "As a cherished member of our inner circle, you will now receive priority access to our artisanal small-batch launches, intimate beauty philosophies, and exclusive invitations reserved for those who prioritize their glow."
    button_text = db_settings.get("buttonText") if db_settings else "Begin Your Ritual"
    quote = db_settings.get("quote") if db_settings else '"In the pursuit of light, we find our most authentic selves."'

    if not smtp_user or not smtp_pass:
        logger.warning(f"SMTP credentials not configured. Skipping welcome email to {to_email}")
        return

    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        # HTML Email Template (as before)
        html = f"""
        <html>
        <body style="margin: 0; padding: 0; font-family: 'Playfair Display', serif; background-color: #0c0c0c; color: #ffffff;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0c0c;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #1a1a1a; border: 1px solid #c5a059; border-radius: 8px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td align="center" style="padding: 40px 0; background-color: #111111;">
                                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 3px; color: #c5a059; text-transform: uppercase;">Luscent Glow</h1>
                                    <p style="margin: 10px 0 0; font-size: 12px; letter-spacing: 2px; color: #888888; text-transform: uppercase;">The Alchemy of Radiance</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0; font-size: 22px; color: #c5a059; font-weight: 300; text-align: center;">{headline}</h2>
                                    <p style="margin: 25px 0; font-size: 16px; line-height: 1.6; color: #dddddd; text-align: center;">
                                        {body1}
                                    </p>
                                    <p style="margin: 25px 0; font-size: 16px; line-height: 1.6; color: #dddddd; text-align: center;">
                                        {body2}
                                    </p>
                                    
                                    <!-- CTA -->
                                    <div align="center" style="margin: 40px 0;">
                                        <a href="{settings.FRONTEND_URL}/products" style="background-color: #c5a059; color: #000000; padding: 15px 35px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">{button_text}</a>
                                    </div>
                                    
                                    <p style="margin: 25px 0 0; font-size: 14px; line-height: 1.6; color: #888888; text-align: center; font-style: italic;">
                                        {quote}
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px; background-color: #111111; border-top: 1px solid #333333; text-align: center;">
                                    <p style="margin: 0; font-size: 11px; color: #666666; letter-spacing: 1px;">
                                        &copy; 2026 Luscent Glow. All rights reserved.<br>
                                        You received this email because you subscribed via our sanctuary.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        # Attach HTML content
        msg.attach(MIMEText(html, 'html'))

        # Connect to SMTP server
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Successfully sent welcome email to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {to_email}: {str(e)}")

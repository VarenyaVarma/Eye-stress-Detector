import smtplib
import os
import time
from email.message import EmailMessage
from email.policy import SMTP
from email.headerregistry import Address
from dotenv import load_dotenv 

# ---------------------------------------
# Load environment variables
# ---------------------------------------
load_dotenv() 

# ---------------------------------------
# Configuration (from .env)
# ---------------------------------------
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SENDER_EMAIL = os.getenv("EMAIL_USER")
SENDER_PASSWORD = os.getenv("EMAIL_PASS") # 👈 your Gmail App Password (no spaces)

# Optional safety check
if not SENDER_EMAIL or not SENDER_PASSWORD:
    raise ValueError("Email credentials missing. Please configure .env file.")


def send_email(to_email, subject, body, attachments=None):
    """
    Send UTF-8 encoded email (with emojis and attachments) safely via Gmail.
    Automatically retries with SSL (port 465) if TLS (port 587) fails.
    """
    msg = EmailMessage(policy=SMTP)
    msg['From'] = Address(display_name='Eye Stress Detection', addr_spec=SENDER_EMAIL)
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body, subtype='plain', charset='utf-8')

    # Attach any files (like pie charts)
    if attachments:
        for path in attachments:
            if not os.path.exists(path):
                print(f"⚠️ Attachment not found: {path}")
                continue
            with open(path, 'rb') as f:
                file_data = f.read()
            msg.add_attachment(
                file_data,
                maintype='application',
                subtype='octet-stream',
                filename=os.path.basename(path)
            )

    # First try TLS on port 587
    try:
        time.sleep(1)  # small delay for Windows sockets
        print("📨 Attempting to send via TLS (port 587)...")
        with smtplib.SMTP(SMTP_SERVER, 587, timeout=15) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"✅ Email successfully sent to {to_email} (TLS)")
        return

    except Exception as e1:
        print(f"⚠️ TLS send failed: {e1}")
        print("🔁 Retrying with SSL (port 465)...")

    # Fallback: Try SSL on port 465
    try:
        time.sleep(1)
        with smtplib.SMTP_SSL(SMTP_SERVER, 465, timeout=15) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"✅ Email successfully sent to {to_email} (SSL)")
    except Exception as e2:
        print(f"❌ Failed to send email to {to_email} via both TLS and SSL: {e2}")

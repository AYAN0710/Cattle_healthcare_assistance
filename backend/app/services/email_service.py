import os
import smtplib
from email.message import EmailMessage


def send_otp_email(recipient_email: str, otp: str) -> None:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        raise RuntimeError("SMTP credentials are not configured.")

    message = EmailMessage()
    message["Subject"] = "LDP - Email Verification OTP"
    message["From"] = smtp_email
    message["To"] = recipient_email
    message.set_content(
        f"""Your Bovicare verification OTP is: {otp}

This OTP expires in 10 minutes. Do not share it with anyone."""
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(message)
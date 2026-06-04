import { ApiError } from '../middleware/errorHandler.js';

export async function sendResetOtpEmail(
    recipientEmail: string,
    recipientName: string,
    otp: string
): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@proempower.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'ProEmpower System';

    if (!apiKey || apiKey === 'your_brevo_api_key_here') {
        console.warn(`[MAILER WARNING] Brevo API Key not configured. Fallback: OTP for ${recipientEmail} is ${otp}`);
        return false;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                sender: {
                    name: senderName,
                    email: senderEmail
                },
                to: [
                    {
                        email: recipientEmail,
                        name: recipientName
                    }
                ],
                subject: 'ProEmpower Password Reset OTP',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #2E31E6; text-align: center;">ProEmpower Security</h2>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p>Hello ${recipientName},</p>
                        <p>We received a request to reset your password. Please use the following 6-digit One-Time Password (OTP) to proceed with your password reset:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2E31E6; background-color: #f8fafc; padding: 10px 20px; border-radius: 6px; border: 1px dashed #cbd5e1; display: inline-block;">
                                ${otp}
                            </span>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">This code is valid for 1 hour. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2024 ProEmpower. All rights reserved.</p>
                    </div>
                `
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[MAILER ERROR] Brevo API returned status ${response.status}: ${errorText}`);
            return false;
        }

        console.log(`[MAILER SUCCESS] OTP email sent successfully to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error(`[MAILER ERROR] Failed to send email to ${recipientEmail}:`, error);
        return false;
    }
}

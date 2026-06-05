import { ApiError } from '../middleware/errorHandler.js';

export async function sendResetOtpEmail(
    recipientEmail: string,
    recipientName: string,
    otp: string
): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@staffsphere.com';
    // Hardcode the name to StaffSphere to prevent stale environment variables (like ProEmpower) from overriding it
    const senderName = 'StaffSphere System';
    const brandName = 'StaffSphere';

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
                subject: 'StaffSphere Password Reset OTP',
                htmlContent: `
                    <div style="background-color: #f4f5f6; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%; width: 100%; box-sizing: border-box; margin: 0;">
                        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03); border: 1px solid #e5e7eb;">
                            <!-- Thin dark blue top accent border -->
                            <div style="background-color: #1e3a8a; height: 4px;"></div>
                            
                            <!-- Main content area -->
                            <div style="padding: 40px 35px 35px 35px;">
                                <!-- Header/Logo area -->
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <div style="display: inline-block; background-color: #f1f5f9; padding: 12px; border-radius: 50%; margin-bottom: 12px;">
                                        <!-- Minimalist lock icon representation -->
                                        <div style="font-size: 24px; line-height: 1; margin: 0; vertical-align: middle;">🔒</div>
                                    </div>
                                    <h2 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; letter-spacing: -0.3px;">${brandName} Security</h2>
                                    <p style="font-size: 11px; font-weight: 700; color: #94a3b8; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Verification Code</p>
                                </div>
                                
                                <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
                                <p style="font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 24px 0;">We received a request to reset your password. Use the verification code below to authorize this request:</p>
                                
                                <!-- OTP Display Box (Pill-shaped) -->
                                <div style="text-align: center; margin: 30px 0;">
                                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 9999px; padding: 12px 36px; display: inline-block;">
                                        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #1e40af; display: inline-block; padding-left: 8px; vertical-align: middle;">${otp}</span>
                                    </div>
                                </div>
                                
                                <!-- Warnings & Expiry callout (Light orange alert) -->
                                <div style="background-color: #fffbef; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 18px; margin: 24px 0;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" style="padding-right: 10px; font-size: 14px; line-height: 18px;">⚠️</td>
                                            <td style="font-size: 13px; line-height: 20px; color: #b45309;">
                                                <strong>Security Note:</strong> This code is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email or contact support.
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 20px 0;">Best regards,<br /><span style="font-weight: 600; color: #475569;">${brandName} Security Team</span></p>
                            </div>
                            
                            <!-- Footer area -->
                            <div style="background-color: #fafafa; padding: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
                                <p style="font-size: 11px; color: #94a3b8; margin: 0 0 5px 0;">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                                <p style="font-size: 10px; color: #cbd5e1; margin: 0;">This is an automated system email. Please do not reply directly.</p>
                            </div>
                        </div>
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

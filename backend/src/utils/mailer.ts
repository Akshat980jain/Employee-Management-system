import { ApiError } from '../middleware/errorHandler.js';

export async function sendResetOtpEmail(
    recipientEmail: string,
    recipientName: string,
    otp: string
): Promise<boolean> {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@staffsphere.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'StaffSphere System';
    const brandName = senderName.endsWith(' System') ? senderName.slice(0, -7) : senderName;

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
                    <div style="background-color: #f8fafc; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%; width: 100%; box-sizing: border-box; margin: 0;">
                        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
                            <!-- Top accent gradient -->
                            <div style="background: linear-gradient(135deg, #2E31E6 0%, #06b6d4 100%); height: 6px;"></div>
                            
                            <!-- Main content area -->
                            <div style="padding: 40px 35px 35px 35px;">
                                <!-- Header/Logo area -->
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <div style="display: inline-block; background-color: #f1f5f9; padding: 12px; border-radius: 12px; margin-bottom: 12px;">
                                        <!-- Styled lock icon representation using a native lock emoji -->
                                        <div style="font-size: 28px; line-height: 1; margin: 0;">🔒</div>
                                    </div>
                                    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px;">${brandName} Security</h2>
                                    <p style="font-size: 13px; font-weight: 600; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                                </div>
                                
                                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 0 0 30px 0;" />
                                
                                <!-- Body Content -->
                                <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 16px 0;">Hello <strong>${recipientName}</strong>,</p>
                                <p style="font-size: 14px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">We received a request to reset your password. Use the verification code below to authorize this request:</p>
                                
                                <!-- OTP Display Box -->
                                <div style="text-align: center; margin: 30px 0;">
                                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 28px; display: inline-block; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
                                        <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2E31E6; display: inline-block; padding-left: 6px; vertical-align: middle;">${otp}</span>
                                    </div>
                                </div>
                                
                                <!-- Warnings & Expiry callout -->
                                <div style="background-color: #fffbef; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin: 24px 0;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td valign="top" style="padding-right: 10px; font-size: 14px; line-height: 18px;">⚠️</td>
                                            <td style="font-size: 13px; line-height: 20px; color: #b45309;">
                                                <strong>Security Note:</strong> This code is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email or contact support.
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style="font-size: 14px; line-height: 20px; color: #64748b; margin: 0 0 20px 0;">Best regards,<br /><span style="font-weight: 600; color: #334155;">${brandName} Security Team</span></p>
                            </div>
                            
                            <!-- Footer area -->
                            <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
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

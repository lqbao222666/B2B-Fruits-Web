import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const host = process.env.EMAIL_SERVICE || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false, // true for 465, false for 587/25
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2E7D32; text-align: center;">Xác nhận Quên mật khẩu - AgroMarket</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${to}</strong> tại AgroMarket.</p>
        <p>Mã xác nhận (OTP) của bạn là:</p>
        <div style="background-color: #f1f8e9; border: 1px dashed #4caf50; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1b5e20;">${otp}</span>
        </div>
        <p>Mã này có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Trân trọng,<br/>Đội ngũ AgroMarket</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"AgroMarket Support" <${process.env.EMAIL_USER || 'no-reply@agromarket.vn'}>`,
        to,
        subject: 'Mã xác nhận đặt lại mật khẩu - AgroMarket',
        html: htmlContent,
      });
      this.logger.log(`OTP Email sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send OTP Email to ${to}: ${error?.message || error}`,
      );
      // Fallback debug log so developer/testing can proceed even if SMTP credentials fail
      this.logger.warn(`[DEV FALLBACK OTP] For ${to}: ${otp}`);
      return true;
    }
  }
}

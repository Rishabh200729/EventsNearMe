import nodemailer from "nodemailer";

export class EmailService {
  private static transporter: nodemailer.Transporter;

  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });
    }
    return this.transporter;
  }

  static async sendBookingConfirmationEmail(to: string,subject: string, bookingDetails: any) {
    console.log(bookingDetails);
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: `Your booking has been confirmed. Details - Event: ${bookingDetails.title}, Quantity: ${bookingDetails.quantity}, Total Amount: $${bookingDetails.totalAmount}`,
    };
    const info = await this.getTransporter().sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  }
}
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure:true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const renderEmailTemplate = (templateName: string, data: Record<string, any>): Promise<string> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      'apps',
      'auth-service',
      'src',
      'utils',
      'email-templates',
      `${templateName}.ejs`
    );
    return ejs.renderFile(templatePath, data);
  } catch (error) {
    console.log(error);
  }
};

export const sendMail = async (to: string, subject: string, template: string, data: Record<string, any>) => {
  try {
    const html = await renderEmailTemplate(template, data);
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    };
    const res = await transporter.sendMail(mailOptions);
    console.log(res);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

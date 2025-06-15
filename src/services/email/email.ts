import nodemailer from "nodemailer";
import config from "@/config/config"
import type Mail from "nodemailer/lib/mailer";
import { sendMailOptionsSchema } from "./validations";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Mail.Attachment[]
}

export const sendMail = async (sendMailOptions: SendMailOptions) => {
  const { data: validatedOptions, error } = sendMailOptionsSchema.safeParse(sendMailOptions);
  if (error) {
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    from: "Y-Network <no-reply@ynov.com>",
    port: 465,
    secure: true,
    auth: {
      user: config.mailing.email,
      pass: config.mailing.password,
    },
  });

    await transporter.sendMail(validatedOptions);
};

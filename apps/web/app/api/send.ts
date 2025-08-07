import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { EmailTemplate } from "../components/Email-Template";

const resend = new Resend(`re_dSinNgp3_LNkq5XfQjNHkc77udhEf1nrN`);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["suryanshvaish6@gmail.com"],
    subject: "Your site is down",
    react: EmailTemplate({ firstName: "John" }),
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json(data);
}

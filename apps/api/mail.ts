const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "watchflow2@gmail.com",
    pass: "xyhzayjoqkhhtioy", // replace with Gmail App Password
  },
});

(async () => {
  const info = await transporter.sendMail({
    from: '"Watch Flow" <watchflow2@gmail.com>',
    to: "suryanshvaish6@gmail.com",
    subject: "🚨 Website Down Alert - Watch Flow",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <table width="100%" style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <tr style="background-color: #ff4d4f; color: white; text-align: center;">
            <td style="padding: 15px; font-size: 20px; font-weight: bold;">
              🚨 Website Down Notification
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; color: #333; font-size: 16px;">
              <p>Hi <b>User</b>,</p>
              <p>We’ve detected that your website is <b style="color: red;">DOWN</b>.</p>
              <p><b>Website:</b> https://example.com <br/>
              <b>Checked at:</b> ${new Date().toLocaleString()}</p>
              <p>Our monitoring system will keep checking your site and notify you once it’s back up.</p>
              <p style="margin-top: 20px;">🔎 Quick Actions:</p>
              <ul>
                <li>Verify your hosting/server status</li>
                <li>Check DNS configurations</li>
                <li>Restart your web service</li>
              </ul>
              <p>If you believe this is an error, please contact our support team.</p>
              <p style="margin-top: 20px;">Stay safe, <br/> <b>Watch Flow Team</b></p>
            </td>
          </tr>
          <tr style="background-color: #f0f0f0; text-align: center;">
            <td style="padding: 15px; font-size: 12px; color: #555;">
              © 2025 Watch Flow | This is an automated message, please do not reply.
            </td>
          </tr>
        </table>
      </div>
    `,
  });

  console.log("Message sent:", info.messageId);
})();

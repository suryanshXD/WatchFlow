import { prisma } from "db/client";
import express from "express";
import { authMiddleware } from "./middleware";
import cors from "cors";
const nodemailer = require("nodemailer");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.post("/api/v1/website", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const { url, interval } = req.body;

  if (!url || !interval) {
    return res.status(400).json({ error: "url and interval are required" });
  }

  if (!["3min", "10min", "20min"].includes(interval)) {
    return res.status(400).json({ error: "interval must be 3, 10, or 20" });
  }

  try {
    const data = await prisma.website.create({
      data: {
        userId,
        url,
        checkInterval: interval,
      },
    });

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/v1/websites", authMiddleware, async (req, res) => {
  const userId = req.userId!;
  const interval = req.query.interval as string;

  if (!["3min", "10min", "20min"].includes(interval)) {
    return res.status(400).json({
      error: "interval query param (3min, 10min, or 20min) is required",
    });
  }

  const websites = await prisma.website.findMany({
    where: {
      userId,
      disabled: false,
      checkInterval: interval,
    },
    include: {
      ticks: true,
    },
  });

  res.json({ websites });
});

app.delete("/api/v1/website/", authMiddleware, async (req, res) => {
  const websiteId = req.body.websiteId;
  const userId = req.userId!;

  await prisma.website.update({
    where: {
      id: websiteId,
      userId,
    },
    data: {
      disabled: true,
    },
  });
});

const checkWebsitesStatus = (intervalLabel: string, ms: number) => {
  setInterval(async () => {
    const websites = await prisma.website.findMany({
      where: { disabled: false, checkInterval: intervalLabel },
    });

    for (const website of websites) {
      const startTime = Date.now();
      let status: "GOOD" | "BAD" = "BAD";

      try {
        const response = await fetch(website.url);
        if (response.status === 200) {
          status = "GOOD";
        }
      } catch (error) {
        console.log(`Error checking ${website.url}:`, error);
      }
      const endTime = Date.now();
      const latency = endTime - startTime;

      const lastTick = await prisma.websiteTick.findFirst({
        where: { websiteId: website.id },
        orderBy: { createdAt: "desc" },
      });

      const userEmail = await prisma.user.findFirst({
        where: {
          clerkUserId: website.userId,
        },
        select: {
          email: true,
        },
      });

      console.log(userEmail);

      if (
        (lastTick?.status !== "BAD" && status === "BAD") ||
        (!lastTick?.status && status === "BAD")
      ) {
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
            to: userEmail?.email,
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
              <p><b>Website:</b> ${website.url}<br/>
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
        console.log("Bad send email to user done");
      }

      await prisma.websiteTick.create({
        data: {
          websiteId: website.id,
          status,
          latency,
          checkInterval: website.checkInterval,
        },
      });

      console.log(`Checked ${website.url}: ${status} (${latency}ms)`);
    }
  }, ms);
};

checkWebsitesStatus("3min", 3 * 60 * 1000);
checkWebsitesStatus("10min", 10 * 60 * 1000);
checkWebsitesStatus("20min", 20 * 60 * 1000);

app.listen(8080, () => console.log("Running on port 8080"));

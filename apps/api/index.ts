import { prisma } from "db/client";
import express from "express";
import { authMiddleware } from "./middleware";

const app = express();
app.use(express.json());

app.post("/api/v1/website", authMiddleware, async (req, res) => {
  const { url } = req.body;
  const { userId } = req.userId!;
  try {
    const data = await prisma.website.create({
      data: {
        userId,
        url,
      },
    });
    const response = await fetch(url);
    const startTime = Date.now();
    try {
      const status: "GOOD" | "BAD" = response.status === 200 ? "GOOD" : "BAD";
      const endTime = Date.now();
      const latency = endTime - startTime;
      await prisma.websiteTick.create({
        data: {
          websiteId: data.id,
          status: status,
          latency: latency,
        },
      });
    } catch (error) {
      console.log(error);
    }
    res.status(201).json(data.id);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/v1/webiste/status", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const websiteId = req.query.websiteId! as unknown as string;
  if (!websiteId) {
    return res.status(401).json({ error: "websiteId missing" });
  }
  const data = await prisma.website.findFirst({
    where: {
      id: websiteId,
      userId,
      disabled: false,
    },
    include: {
      ticks: true,
    },
  });
  res.json(data);
});

app.get("/api/v1/websites", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const websites = await prisma.website.findMany({
    where: {
      userId,
      disabled: false,
    },
    include: {
      ticks: true,
    },
  });
  res.json(websites);
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

const checkWebsitesStatus = () => {
  setInterval(
    async () => {
      const websites = await prisma.website.findMany({
        where: { disabled: false },
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
        const latency = Date.now() - startTime;

        await prisma.websiteTick.create({
          data: {
            websiteId: website.id,
            status,
            latency,
          },
        });

        console.log(`Checked ${website.url}: ${status} (${latency}ms)`);
      }
    },
    3 * 60 * 1000
  );
};

checkWebsitesStatus();

app.listen(8080, () => console.log("Running on port 8080"));

import { prisma } from "db/client";
import express from "express";

const app = express();
app.use(express.json());

app.post("/api/v1/website", async (req, res) => {
  const { url } = req.body;
  try {
    const data = await prisma.website.create({
      data: {
        url,
      },
    });
    const response = await fetch(url);
    const startTime = Date.now();
    try {
      const status: "GOOD" | "BAD" = response.status === 200 ? "GOOD" : "BAD";
      const endTime = Date.now();
      const latency = endTime - startTime;
      const tickData = await prisma.websiteTick.create({
        data: {
          websiteId: data.id,
          status: status,
          latency: latency,
        },
      });
      res.json({
        mssg: tickData.status,
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("api/v1/website", async (req, res) => {
  const url = req.body;
  const response = await fetch(url);
  const startTime = Date.now();
  try {
    const output = response.status === 200 ? "Good" : "Bad";
    const endTime = Date.now();
    const latency = endTime - startTime;
    res.json({
      mssg: output,
      latency: latency,
    });
  } catch (e) {
    console.log(e);
  }
});

app.listen(8080, () => console.log("Running on port 8080"));

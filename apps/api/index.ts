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
    res.json({
      id: data.id,
    });
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

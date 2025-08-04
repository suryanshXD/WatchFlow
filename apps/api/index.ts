import express from "express";

const app = express();
app.use(express.json());

app.post("/website", async (req, res) => {
  const { website } = req.body;
  const startTime = Date.now();
  const response = await fetch(website);
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

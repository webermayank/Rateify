import express from "express";
import { rateLimit } from "@rate-limiter/express";
import { connectRedis } from "@rate-limiter/core";

async function start() {
  await connectRedis(); 

  const app = express();

  app.use(
    "/login",
    rateLimit({
      limit: 3,
      windowSeconds: 10
    })
  );

  app.use(
    "/api",
    rateLimit({
      limit: 10,
      windowSeconds: 10,
    })
  );

  app.get("/login", (req, res) => {
    res.json({ message: "login ok" });
  });

  app.get("/api", (req, res) => {
    res.json({ message: "api ok" });
  });

  app.listen(3000, () => {
    console.log("Demo server running on http://localhost:3000");
  });
}

start();

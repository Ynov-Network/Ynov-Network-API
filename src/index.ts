import express from "express";
import { app, server } from "./lib/socket";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import config from "./config/config";
import connectMongoDB from "./db";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";
import apiServices from "./services";

app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

app.all("/api/better-auth/*splat", toNodeHandler(auth))

app.use(express.json())
app.use(cookieParser());


app.use("/api", apiServices);

server.listen(config.server.port, async () => {
  await connectMongoDB()
  console.log(`🚀 Server running in ${config.env} mode on port ${config.server.port}`);
  if (config.env === "development") {
    console.log(`➜ Local: http://${config.server.host}:${config.server.port}`);
  }
})

export default server;
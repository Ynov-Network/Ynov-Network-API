import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "@/services/auth/routes"
import config from "@/config/config";

const authApp = express();

authApp.use(helmet());
authApp.disable("x-powered-by");
authApp.use(cookieParser());
authApp.use(express.urlencoded({ extended: true }));

authApp.use(
  cors({
    origin: config.server.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

authApp.use(express.json());

authApp.get("/health", (req, res) => {
  res.status(200).json({
    message: "Auth service is healthy",
    timestamp: new Date().toISOString(),
  });
});

authApp.use("/", authRouter);

export { authApp };
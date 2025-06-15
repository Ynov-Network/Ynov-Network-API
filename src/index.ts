import { app, server } from "./lib/socket";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import config from "./config/config";
import connectMongoDB from "./db";
import apiServices from "./services";

app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

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
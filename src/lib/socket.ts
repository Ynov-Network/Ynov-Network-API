import { Server } from "socket.io";
import http from "node:http";
import express from "express";
import config from "@/config/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: config.server.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);
app.use(cookieParser());
app.all("/api/better-auth/*splat", toNodeHandler(auth))

const io = new Server(server, {
  cors: {
    origin: config.server.corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  },
});

export function getReceiverSocketId(userId: string) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap: { [key: string]: string } = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
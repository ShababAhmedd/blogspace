import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.ts";
import userRoute from "./routes/user.route.ts";
import blogRoute from "./routes/blog.route.ts";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/", authRoute);
app.use("/", userRoute);
app.use("/", blogRoute);

export default app;

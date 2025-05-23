import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.config";
import authRouter from "./routes/auth.routes";
import propertiesRouter from "./routes/properties.routes";
import paypalRouter from "./routes/paypal.routes";
import aiRouter from "./routes/ai.routes";
import wishlistRouter from "./routes/wishlist.routes";
import { initializeDefaultPrompt } from "./utils/ai.utils";
import userRouter from "./routes/user.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/paypal", paypalRouter);
app.use("/api/auth", authRouter);
app.use("/api/ai", aiRouter);
app.use("/wishlist", wishlistRouter);
app.use("/", propertiesRouter);
app.use("/", userRouter);
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

const PORT = parseInt(process.env.PORT || "10000", 10);
const HOST = "0.0.0.0";

app.listen(PORT, HOST, async () => {
  await initializeDefaultPrompt();
  console.log(`Server running on port ${PORT}`);
});

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import recommendRoute from "./routes/recommend";

const app = express();
app.use(cors());
app.use(express.json());

// Add rate limiting middleware 
const recommendLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,
  message: "Too many requests, please try again later.",
});

app.use("/api/recommend", recommendLimiter, recommendRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

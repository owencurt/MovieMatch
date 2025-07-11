import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import recommendRoute from "./routes/recommend";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/recommend", recommendRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

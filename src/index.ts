import path from "node:path";
import express from "express";
import cors from "cors";
import { router } from "./router";

const app = express();
const PORT = 4000;

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));
app.use(express.json());
app.use(cors());

app.use(router);

app.listen(PORT, () => {
  console.log(`\u{1F525} Server is running on port http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import router from "./router.js";

const app = express();

app.use(express.json());

app.use("/", router);
app.get("/", async (req, res, next) => {
  res.send("Hello World!");
});

app.listen(5001, () => {
  console.log("Server listening on port 5001...");
});

import express from "express";

const app = express();
const port = process.env.PORT || 7000;

app.get("/", (req, res) => {
  res.status(200).json({ massage: "Hllow mohite!!" });
});

app.listen(port, () => {
  console.log(`server is running on port:${port}`);
});

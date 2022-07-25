const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = require("./routes/apiRouter");

app.use("/api", apiRouter);

app.use("*", (req, res) => {
  res.status(404).send({ message: "404 Not Found (Invalid Path)" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  }
  if (err.code) {
    res.status(400).send({ message: "Invalid data type passed to endpoint." });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "Server Error" });
});

module.exports = app;

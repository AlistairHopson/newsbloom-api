const express = require("express");

const { getTopics } = require("./controllers/news.controllers");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.use("*", (req, res) => {
  res.status(404).send({ message: "404 Not Found (Invalid Path)" });
});

app.use((err, req, res, next) => {
  console.log(err);

  res.status(500).send({ message: "Server Error" });
});

module.exports = app;

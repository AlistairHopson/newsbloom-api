const express = require("express");

const {
  getTopics,
  getArticleByID,
  patchArticleVotes,
  getUsers,
  getArticles,
  getArticleComments,
  postArticleComment,
  deleteCommentByID,
  getApi,
} = require("./controllers/news.controllers");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleByID);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.get("/api/users", getUsers);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postArticleComment);

app.delete("/api/comments/:comment_id", deleteCommentByID);

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

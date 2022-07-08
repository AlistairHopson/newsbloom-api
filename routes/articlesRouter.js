const articles = require("../db/data/test-data/articles");
const {
  getArticles,
  getArticleComments,
  getArticleByID,
  postArticleComment,
  patchArticleVotes,
} = require("../controllers/news.controllers");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);

articlesRouter.get("/:article_id", getArticleByID);
articlesRouter.patch("/:article_id", patchArticleVotes);

articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postArticleComment);

module.exports = articlesRouter;

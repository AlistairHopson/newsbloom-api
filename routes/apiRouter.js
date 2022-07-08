const express = require("express");
const apiRouter = express.Router();
const { getApi } = require("../controllers/news.controllers");
apiRouter.get("/", getApi);

const articlesRouter = require("./articlesRouter");
const commentsRouter = require("./commentsRouter");
const topicsRouter = require("./topicsRouter");
const usersRouter = require("./usersRouter");

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;

const commentsRouter = require("express").Router();

const { deleteCommentByID } = require("../controllers/news.controllers");

commentsRouter.delete("/:comment_id", deleteCommentByID);

module.exports = commentsRouter;

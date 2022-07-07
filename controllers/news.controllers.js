const {
  selectTopics,
  selectArticleByID,
  updateArticleVotes,
  selectUsers,
  selectArticles,
  selectCommentsByArticle,
  insertComment,
  removeCommentByID,
} = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => res.status(200).send({ topics }))
    .catch(next);
};

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleByID(article_id)
    .then((article) => res.status(200).send({ article }))
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => res.status(200).send({ updatedArticle }))
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const sortRequest = req.query.sort_by;
  const orderRequest = req.query.order;
  const topicRequest = req.query.topic;

  selectArticles(sortRequest, orderRequest, topicRequest)
    .then((articles) => res.status(200).send({ articles }))
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  selectCommentsByArticle(article_id)
    .then((comments) =>
      res.status(200).send({
        comments,
      })
    )
    .catch(next);
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username } = req.body;
  const { body } = req.body;
  insertComment(article_id, username, body)
    .then((addedComment) => res.status(201).send({ comment: addedComment }))
    .catch(next);
};

exports.deleteCommentByID = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentByID(comment_id)
    .then(() => res.sendStatus(204))
    .catch(next);
};

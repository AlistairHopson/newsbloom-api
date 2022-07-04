const { selectTopics, selectArticleByID } = require("../models/news.models");

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

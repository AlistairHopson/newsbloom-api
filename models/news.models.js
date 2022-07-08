const e = require("express");
const format = require("pg-format");
const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleByID = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `There are no articles with an ID of ${article_id}.`,
        });
      }
      return rows[0];
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      "UPDATE articles SET votes = votes + $2 WHERE article_id = $1 RETURNING *",
      [article_id, inc_votes]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `There are no articles with an ID of ${article_id}.`,
        });
      }
      return rows[0];
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortOptions = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "comment_count",
  ];
  if (!validSortOptions.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      message: `${sort_by} is not a valid sorting criteria.`,
    });
  }

  const validOrderOptions = ["asc", "desc", "ASC", "DESC"];
  if (!validOrderOptions.includes(order)) {
    return Promise.reject({
      status: 400,
      message: `${order} is not a valid ordering criteria.`,
    });
  }

  const validTopicOptions = ["mitch", "cats"];
  if (topic !== undefined && !validTopicOptions.includes(topic)) {
    return Promise.reject({
      status: 404,
      message: `There are no articles with ${topic} as a topic.`,
    });
  }

  const queryValues = [];
  let queryStr = `SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsByArticle = (article_id) => {
  return db
    .query(
      `
      SELECT * FROM articles
      WHERE article_id = $1
    `,
      [article_id]
    )
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `There are no articles with an ID of ${article_id}.`,
        });
      }
      return db
        .query(
          `SELECT * FROM comments
      WHERE article_id = $1`,
          [article_id]
        )
        .then(({ rows }) => {
          return rows;
        });
    });
};

exports.insertComment = (article_id, username, body) => {
  if (username === undefined) {
    return Promise.reject({
      status: 400,
      message: "Username required to add comment.",
    });
  }
  if (body === undefined) {
    return Promise.reject({
      status: 400,
      message: "Post body required to add comment.",
    });
  }

  return db
    .query(
      `
      SELECT * FROM users
      WHERE username = $1
    `,
      [username]
    )
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message:
            "Only registered users can comment on articles. Please register first.",
        });
      }
      return db
        .query(
          `
        SELECT * FROM articles
        WHERE article_id = $1
      `,
          [article_id]
        )
        .then(({ rowCount }) => {
          if (rowCount === 0) {
            return Promise.reject({
              status: 404,
              message: `There are no articles with an ID of ${article_id}.`,
            });
          }
          return db.query(
            `INSERT INTO comments (article_id, author, body)
          VALUES ($1, $2, $3)
          RETURNING *`,
            [article_id, username, body]
          );
        })
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

exports.removeCommentByID = (comment_id) => {
  if (!Number(+comment_id)) {
    return Promise.reject({
      status: 400,
      message: `${comment_id} is not a valid ID.`,
    });
  }
  return db
    .query(
      `
      SELECT * FROM comments
      WHERE comment_id = $1
    `,
      [comment_id]
    )
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `There are no comments with an ID of ${comment_id}.`,
        });
      }
      return db
        .query(
          `DELETE FROM comments
        WHERE comment_id = $1`,
          [comment_id]
        )
        .then((result) => {
          return result;
        });
    });
};

exports.selectUserByUsername = (username) => {
  return db
    .query(
      `SELECT * FROM users
    WHERE username = $1`,
      [username]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `There are no users with ${username} as a username.`,
        });
      }
      return rows[0];
    });
};

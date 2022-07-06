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

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count
      FROM articles
      LEFT JOIN comments
      ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY created_at DESC;`
    )
    .then(({ rows }) => {
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

exports.insertComment = (article_id, username, comment) => {
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
          status: 401,
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
            [article_id, username, comment]
          );
        })
        .then(({ rows }) => {
          return rows[0];
        });
    });
};

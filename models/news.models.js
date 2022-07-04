const format = require("pg-format");
const db = require("../db/connection");

exports.selectTopics = () => {
  return db
    .query("SELECT * FROM topics;")
    .then((results) => {
      return results.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};

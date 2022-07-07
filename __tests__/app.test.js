const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");

const seed = require("../db/seeds/seed");

const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data");

beforeEach(() => seed({ articleData, commentData, topicData, userData }));

afterAll(() => {
  if (db.end) db.end();
});

describe("/notARoute", () => {
  test("client receives '404 Not Found' for a GET request to an invalid route", () => {
    return request(app)
      .get("/api/topicz")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("404 Not Found (Invalid Path)");
      });
  });
});

describe("GET /api/topics", () => {
  test("returns an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBeGreaterThanOrEqual(0);
        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("returns relevant article information for specific ID (including count of comments)", () => {
    return request(app)
      .get("/api/articles/9")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.article).toEqual(
          expect.objectContaining({
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            votes: 0,
            comment_count: 2,
          })
        );
      });
  });
  test("comment count is 0 for articles with no comments", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.article).toEqual(
          expect.objectContaining({
            comment_count: 0,
          })
        );
      });
  });
  test("requests for non-existing article IDs are rejected (404)", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "There are no articles with an ID of 999999."
        );
      });
  });
  test("invalid input requests are rejected (400)", () => {
    return request(app)
      .get("/api/articles/nineninenine")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid data type passed to endpoint.");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("article votes can be increased", () => {
    const addedVotes = { inc_votes: 55 };
    return request(app)
      .patch("/api/articles/9")
      .send(addedVotes)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.updatedArticle).toEqual(
          expect.objectContaining({
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            votes: 55,
          })
        );
      });
  });
  test("article votes can be decreased", () => {
    const addedVotes = { inc_votes: -55 };
    return request(app)
      .patch("/api/articles/9")
      .send(addedVotes)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.updatedArticle).toEqual(
          expect.objectContaining({
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            votes: -55,
          })
        );
      });
  });
  test("article votes unchanged if inc_votes is 0", () => {
    const addedVotes = { inc_votes: 0 };
    return request(app)
      .patch("/api/articles/9")
      .send(addedVotes)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.updatedArticle).toEqual(
          expect.objectContaining({
            title: "They're not exactly dogs, are they?",
            topic: "mitch",
            author: "butter_bridge",
            body: "Well? Think about it.",
            votes: 0,
          })
        );
      });
  });
  test("requests to patch invalid article IDs are rejected", () => {
    const addedVotes = { inc_votes: 99 };
    return request(app)
      .patch("/api/articles/999999")
      .send(addedVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "There are no articles with an ID of 999999."
        );
      });
  });
  test("requests made with invalid inc_votes category are rejected", () => {
    const addedVotes = { inc_votes: "winter" };
    return request(app)
      .patch("/api/articles/9")
      .send(addedVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid data type passed to endpoint.");
      });
  });
});

describe("GET /api/users", () => {
  test("returns an array of topic objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBeGreaterThan(0);
        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/articles", () => {
  test("returns an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("articles are sorted by date (descending) by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("articles can be sorted by specified column", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("article order can be specified", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("article sorting and ordering criteria can both be specified", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("votes", { ascending: true });
      });
  });
  test("articles can be filtered by specified topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(1);
        expect(body.articles[0]).toEqual(
          expect.objectContaining({
            article_id: 5,
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            created_at: expect.any(String),
            votes: 0,
            comment_count: 2,
          })
        );
      });
  });
  test("articles can be filtered by specified topic, and article sorting and ordering criteria can also both be specified", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=desc&topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(11);
        expect(body.articles).toBeSortedBy("votes", { descending: true });
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: "mitch",
              author: expect.any(String),
              body: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
  test("invalid sort_by requests are rejected", () => {
    return request(app)
      .get("/api/articles?sort_by=rating")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("rating is not a valid sorting criteria.");
      });
  });
  test("invalid sort_by requests are rejected", () => {
    return request(app)
      .get("/api/articles?order=downwards")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "downwards is not a valid ordering criteria."
        );
      });
  });
  test("invalid topic requests are rejected", () => {
    return request(app)
      .get("/api/articles?topic=space")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "There are no articles with space as a topic."
        );
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("returns relevant comments for specific article ID", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        expect(body.comments[0]).toEqual(
          expect.objectContaining({
            comment_id: 14,
            body: "What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.",
            article_id: 5,
            author: "icellusedkars",
            votes: 16,
          })
        );
        expect(body.comments[1]).toEqual(
          expect.objectContaining({
            comment_id: 15,
            body: "I am 100% sure that we're not completely sure.",
            article_id: 5,
            author: "butter_bridge",
            votes: 1,
          })
        );
      });
  });
  test("If an article has no comments, returns an empty array (200)", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
  test("requests to view article comments with invalid article IDs are rejected", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "There are no articles with an ID of 999999."
        );
      });
  });
  test("If request parameters are invalid, returns 400 error", () => {
    return request(app)
      .get("/api/articles/five/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid data type passed to endpoint.");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("allows comment to be posted on article with valid ID", () => {
    const testComment = { username: "icellusedkars", body: "I agree!" };
    return request(app)
      .post("/api/articles/5/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: 19,
            body: "I agree!",
            article_id: 5,
            author: "icellusedkars",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("does not allow comments to be posted by unexisting usernames (i.e. unregistered users)", () => {
    const testComment = { username: "dave", body: "I agree!" };
    return request(app)
      .post("/api/articles/5/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Only registered users can comment on articles. Please register first."
        );
      });
  });

  test("requests to comment on non-existing articles are rejected", () => {
    const testComment = { username: "icellusedkars", body: "I agree!" };
    return request(app)
      .post("/api/articles/999999/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(
          "There are no articles with an ID of 999999."
        );
      });
  });
  test("users cannot comment on invalid request parameters", () => {
    const testComment = { username: "icellusedkars", body: "I agree!" };
    return request(app)
      .post("/api/articles/five/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid data type passed to endpoint.");
      });
  });

  test("users cannot comment with an incorrect post body (missing username)", () => {
    const testComment = { myName: "icellusedkars", body: "I agree!" };
    return request(app)
      .post("/api/articles/5/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username required to add comment.");
      });
  });

  test("users cannot comment with an incorrect post body (missing body)", () => {
    const testComment = { username: "icellusedkars", myThoughts: "I agree!" };
    return request(app)
      .post("/api/articles/5/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Post body required to add comment.");
      });
  });
});

describe("DELETE /api/COMMENTS/:comment_id", () => {
  test("204 is sent to client when deleting a comment by a valid path", () => {
    return request(app)
      .delete("/api/comments/7")
      .expect(204)
      .then(() => {
        return db.query(`SELECT * FROM comments WHERE comment_id = 7;`);
      })
      .then(({ rowCount }) => {
        expect(rowCount).toBe(0);
      });
  });
  test("400 is sent to client when trying to delete a comment by an invalid path", () => {
    return request(app)
      .delete("/api/comments/seven")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("seven is not a valid ID.");
      });
  });
  test("404 is sent to client when trying to delete a non-existing comment (with valid parameters)", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("There are no comments with an ID of 99999.");
      });
  });
  test("Valid comments can only be deleted once", () => {
    return request(app)
      .delete("/api/comments/7")
      .expect(204)
      .then(request(app).delete("/api/comments/7").expect(404));
  });
});

describe("getApi", () => {
  test("returns endpoints JSON", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            "/api": expect.any(Object),
            "/api/articles": expect.any(Object),
            "/api/articles:article_id": expect.any(Object),
            "/api/articles/:article_id/comments": expect.any(Object),
            "/api/comments/:comment_id": expect.any(Object),
            "/api/topics": expect.any(Object),
            "/api/users": expect.any(Object),
          })
        );
      });
  });
});

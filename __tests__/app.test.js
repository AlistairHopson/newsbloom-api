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

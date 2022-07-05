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
        expect(body.topics.length > 0).toBe(true);
        body.topics.forEach(() => {
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("returns relevant article information for specific ID", () => {
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
      .expect(400)
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

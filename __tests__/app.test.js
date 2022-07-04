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
        expect(body.topics.length > 0);
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
        expect.objectContaining({
          title: "They're not exactly dogs, are they?",
          topic: "mitch",
          author: "butter_bridge",
          body: "Well? Think about it.",
          created_at: 1591438200000,
          votes: 0,
        });
      });
  });
  test("requests for invalid article IDs are rejected", () => {
    return request(app)
      .get("/api/articles/999999")
      .expect(404)
      .then(({ body }) => {
        console.log(body);
        expect(body.message).toBe("999999 is not a valid article ID.");
      });
  });
});

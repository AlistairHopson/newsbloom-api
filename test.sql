-- SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count
-- FROM articles
-- LEFT JOIN comments
-- ON articles.article_id = comments.article_id
-- GROUP BY articles.article_id;

\c nc_news_test

SELECT articles.*, COUNT(comments.comment_id)::INT as comment_count
FROM articles
LEFT JOIN comments
ON articles.article_id = comments.article_id
GROUP BY articles.article_id
ORDER BY created_at DESC;
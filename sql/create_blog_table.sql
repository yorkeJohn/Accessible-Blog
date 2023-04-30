# create_blog_table.sql

DROP TABLE IF EXISTS blogs;

CREATE TABLE blogs (
  BlogID INT(3) NOT NULL AUTO_INCREMENT,
  BlogTitle VARCHAR(30),
  BlogText TEXT,
  Published BOOLEAN,
  PRIMARY KEY (BlogID)
);

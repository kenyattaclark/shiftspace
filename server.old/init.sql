CREATE TABLE shift (
  id INTEGER PRIMARY KEY,
  space VARCHAR(255),
  href VARCHAR(255),
  user_id INTEGER,
  summary TEXT,
  content TEXT,
  domain VARCHAR(255),
  url_slug VARCHAR(255),
  created DATETIME,
  modified DATETIME,
  version VARCHAR(255),
  revision INTEGER DEFAULT 1,
  parent_id INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  broken INTEGER DEFAULT 0
);

CREATE TABLE broken (
  id INTEGER PRIMARY KEY,
  space VARCHAR(255),
  href VARCHAR(255),
  user_id INTEGER,
  summary TEXT,
  content TEXT,
  domain VARCHAR(255),
  url_slug VARCHAR(255),
  created DATETIME,
  modified DATETIME,
  version VARCHAR(255),
  revision INTEGER DEFAULT 1,
  parent_id INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  broken INTEGER DEFAULT 0
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255),
  display_name VARCHAR(255),
  email VARCHAR(255),
  last_seen DATETIME,
  joined DATETIME,
  status INTEGER DEFAULT 0,
  email_comments INTEGER DEFAULT 1
);

CREATE TABLE trail (
  id INTEGER PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  user_id VARCHAR(255),
  created DATETIME,
  modified DATETIME,
  url_slug VARCHAR(255),
  thumb_status INTEGER DEFAULT 0,
  version VARCHAR(255),
  status INTEGER DEFAULT 1
);

CREATE TABLE comment (
  id INTEGER PRIMARY KEY,
  user_id VARCHAR(255),
  shift_id INTEGER,
  content TEXT,
  created DATETIME,
  modified DATETIME
);

CREATE TABLE trail_shift (
  trail_id INTEGER,
  shift_id INTEGER
);

CREATE TABLE sandbox (
  id TEXT,
  value TEXT
);

CREATE TABLE favorite (
  id INTEGER PRIMARY KEY,
  shift_id INTEGER,
  user_id INTEGER,
  date DATETIME
);

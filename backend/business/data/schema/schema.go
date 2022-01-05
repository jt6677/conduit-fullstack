// Package schema contains the database schema, migrations and seeding data.
package schema

import (
	"github.com/dimiro1/darwin"
	"github.com/jmoiron/sqlx"
)

// Migrate attempts to bring the schema for db up to date with the migrations
// defined in this package.
func Migrate(db *sqlx.DB) error {
	driver := darwin.NewGenericDriver(db.DB, darwin.PostgresDialect{})
	d := darwin.New(driver, migrations, nil)
	return d.Migrate()
}

// migrations contains the queries needed to construct the database schema.
// Entries should never be removed from this slice once they have been ran in
// production.
//
// Using constants in a .go file is an easy way to ensure the queries are part
// of the compiled executable and avoids pathing issues with the working
// directory. It has the downside that it lacks syntax highlighting and may be
// harder to read for some cases compared to using .sql files. You may also
// consider a combined approach using a tool like packr or go-bindata.
var migrations = []darwin.Migration{
	{
		Version:     1,
		Description: "Add users table",
		Script: `
CREATE TABLE users (
	user_id       UUID,
	username      TEXT UNIQUE NOT NULL,
	email         TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	bio           TEXT,
	image         TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id)
);`,
	},
	{
		Version:     2,
		Description: "Add articles table",
		Script: `
CREATE TABLE articles (
	article_id		UUID,
	author_id		UUID,
	slug			TEXT UNIQUE NOT NULL,
	title			TEXT UNIQUE NOT NULL,
	description		TEXT NOT NULL,
	body			TEXT,
	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (article_id),
	FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);`,
	},
	{
		Version:     3,
		Description: "Add favorites table",
		Script: `
CREATE TABLE favorites (
	article_id		UUID,
	user_id		UUID,
	PRIMARY KEY (article_id,user_id),
	FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);`,
	},
	{
		Version:     4,
		Description: "Add comments table",
		Script: `
CREATE TABLE comments (
	comment_id		UUID,
	commenter_id	UUID,
	article_id		UUID,
	parent_id		TEXT,
	body			TEXT,
	created_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at		TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	deleted_at		TIMESTAMP DEFAULT NULL,
	deleted           BOOLEAN DEFAULT FALSE,
	PRIMARY KEY (comment_id),
	FOREIGN KEY (commenter_id) REFERENCES users(user_id) ON DELETE CASCADE,
	FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE
);`,
	},
	{
		Version:     5,
		Description: "Create procedure automatically updating updated_at field",
		Script: `
CREATE OR REPLACE FUNCTION set_updated_at()
	RETURNS TRIGGER AS $$
	BEGIN
	NEW.updated_at = now();
	RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;	
		`,
	},
	{
		Version:     6,
		Description: "Add set_updated_at_articles trigger to articles table",
		Script: `
CREATE TRIGGER set_updated_at_articles
	AFTER UPDATE ON articles
	FOR EACH ROW
	EXECUTE PROCEDURE set_updated_at();
	`,
	},
	{
		Version:     7,
		Description: "Add set_updated_at_comments trigger to comments table",
		Script: `
CREATE TRIGGER set_updated_at_comments
	AFTER UPDATE ON comments
	FOR EACH ROW
	EXECUTE PROCEDURE set_updated_at();
	`,
	},
	{
		Version:     8,
		Description: "Add set_updated_at_users trigger to users table",
		Script: `
CREATE TRIGGER set_updated_at_users
	AFTER UPDATE ON users
	FOR EACH ROW
	EXECUTE PROCEDURE set_updated_at();
	`,
	},
	{
		Version:     9,
		Description: "Create procedure automatically updating deleted_at field",
		Script: `
CREATE OR REPLACE FUNCTION set_deleted_at()
	RETURNS TRIGGER AS
	$BODY$
	BEGIN
		IF OLD.deleted = TRUE AND NEW.deleted = FALSE THEN 
		NEW.deleted_at := NULL;
		ELSEIF OLD.deleted = FALSE AND NEW.deleted = TRUE THEN 
		NEW.deleted_at := now();
	END IF;
	RETURN NEW;
	END;
	$BODY$
	LANGUAGE plpgsql;
	`,
	},
	{
		Version:     10,
		Description: "Add set_deleted_at_comments trigger to comments table when deleted field is set to true",
		Script: `
CREATE TRIGGER set_deleted_at_comments
	BEFORE UPDATE ON comments
	FOR EACH ROW
	EXECUTE PROCEDURE set_deleted_at();
	`,
	},
}

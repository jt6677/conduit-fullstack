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
		Description: "Add users",
		Script: `
CREATE TABLE users (
	user_id       serial NOT NULL,
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
		Description: "Add articles",
		Script: `
CREATE TABLE articles (
	article_id		serial NOT NULL,
	author_id		INTEGER NOT NULL,
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
		Description: "Add favorites",
		Script: `
CREATE TABLE favorites (
	article_id		INTEGER NOT NULL,
	user_id		INTEGER NOT NULL,
	PRIMARY KEY (article_id,user_id),
	FOREIGN KEY (article_id) REFERENCES articles(article_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);`,
	},
}

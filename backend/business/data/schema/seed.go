package schema

import (
	"github.com/jmoiron/sqlx"
)

// Seed runs the set of seed-data queries against db. The queries are ran in a
// transaction and rolled back if any fail.
func Seed(db *sqlx.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	if _, err := tx.Exec(seeds); err != nil {
		if err := tx.Rollback(); err != nil {
			return err
		}
		return err
	}

	return tx.Commit()
}

// seeds is a string constant containing all of the queries needed to get the
// db seeded to a useful state for development.
//
// Note that database servers besides PostgreSQL may not support running
// multiple queries as part of the same execution so this single large constant
// may need to be broken up.

//qweqweqwe= $2a$10$3tC6Wv/k01nzS1ktCI/iNO.iTIGNauHtRe3pJ4RrPN.Xi4DcIbChm
const seeds = `

-- Create admin and regular User with password "qweqweqwe"
INSERT INTO users ( username, email,  password_hash, date_created, date_updated) VALUES
	('123', '123@123.com',  '$2a$10$3tC6Wv/k01nzS1ktCI/iNO.iTIGNauHtRe3pJ4RrPN.Xi4DcIbChm', '2019-03-24 00:00:00', '2019-03-24 00:00:00'),
	('qwe', 'qwe@qwe.com',  '$2a$10$DAuFZyv1Kna3JGb/hxPfq.B5x5C2aonraeFmSHphye0/QE02ROS86', '2019-03-24 00:00:00', '2019-03-24 00:00:00')
	ON CONFLICT DO NOTHING;

	`

// DeleteAll runs the set of Drop-table queries against db. The queries are ran in a
// transaction and rolled back if any fail.
func DeleteAll(db *sqlx.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	if _, err := tx.Exec(deleteAll); err != nil {
		if err := tx.Rollback(); err != nil {
			return err
		}
		return err
	}

	return tx.Commit()
}

// deleteAll is used to clean the database between tests.
const deleteAll = `
DELETE FROM users;
DELETE FROM sessions;
ALTER SEQUENCE users_user_id_seq  RESTART;
ALTER SEQUENCE sessions_session_id_seq RESTART;
`

// DELETE FROM articles_article_id_seq;
// DELETE FROM articleactions_articleaction_id_seq;

// DELETE FROM users_user_id_seq;

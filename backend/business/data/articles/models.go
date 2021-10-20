package articles

import (
	"time"

	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/business/data/user"
)

//Article struct for writing to database
type Article struct {
	Id             int               `db:"article_id"`
	Slug           string            `db:"slug" json:"slug"`
	Title          string            `db:"title" json:"title"`
	Description    string            `db:"description" json:"description"`
	Body           string            `db:"body" json:"body"`
	TagList        schema.NullString `db:"taglist" json:"taglist"`
	CreatedAt      schema.NullTime   `db:"created_at" json:"created_at" `
	UpdatedAt      schema.NullTime   `db:"updated_at" json:"updated_at" `
	Favorited      bool              `db:"favorited" json:"favorited"`
	FavoritesCount schema.NullInt32  `db:"favorites_count" json:"favorites_count"`
	AuthorId       int               `db:"author_id"`
}

//TrustedArticle is safe to return to frontend
type TrustedArticle struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Body        string `json:"body"`
	// TagList        schema.NullString    `json:"tag_list"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
	Favorited      bool                 `json:"favorited"`
	FavoritesCount string               `json:"favorites_count"`
	Author         user.TrustedUserInfo `json:"author"`
}

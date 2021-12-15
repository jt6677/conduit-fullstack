package articles

import (
	"time"

	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/business/data/user"
)

//Article struct for writing to database
type Article struct {
	Id             string           `db:"article_id" json:"article_id"`
	AuthorId       string           `db:"author_id" json:"author_id"`
	Author         user.UserInfo    `json:"author"`
	Slug           string           `db:"slug" json:"slug"`
	Title          string           `db:"title" json:"title"`
	Description    string           `db:"description" json:"description"`
	Body           string           `db:"body" json:"body"`
	CreatedAt      *schema.NullTime `db:"created_at" json:"created_at" `
	UpdatedAt      *schema.NullTime `db:"updated_at" json:"updated_at" `
	Favorited      bool             `json:"favorited"`
	FavoritesCount int              `json:"favorites_count"`
	// TagList     schema.NullString `db:"taglist" json:"taglist"`
	// Favorited bool            ` json:"favorited"`
	// FavoritesCount schema.NullInt32  `db:"favorites_count" json:"favorites_count"`
}

//TrustedArticle is safe to return to frontend
type TrustedArticle struct {
	Id             string        `json:"article_id"`
	Slug           string        `json:"slug"`
	Title          string        `json:"title"`
	Description    string        `json:"description"`
	Body           string        `json:"body"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
	Favorited      bool          `json:"favorited"`
	FavoritesCount int           `json:"favorites_count"`
	Author         user.UserInfo `json:"author"`
}

type Favorites struct {
	ArticleId string `db:"article_id"`
	UserId    string `db:"user_id"`
}

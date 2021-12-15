package comments

import (
	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/business/data/user"
)

type Comment struct {
	Id            string           `db:"comment_id" json:"comment_id"`
	CommenterId   string           `db:"commenter_id" json:"commenter_id"`
	ArticleId     string           `db:"article_id" json:"article_id"`
	ParentId      string           `db:"parent_id" json:"parent_id"`
	Body          string           `db:"body" json:"body"`
	CommenterInfo user.UserInfo    `json:"author"`
	CreatedAt     *schema.NullTime `db:"created_at" json:"created_at,omitempty"`
	UpdatedAt     *schema.NullTime `db:"updated_at" json:"updated_at,omitempty"`
	Deleted       bool             `db:"deleted" json:"deleted,omitempty"`
	DeletedAt     *schema.NullTime `db:"deleted_at" json:"deleted_at,omitempty"`
}

// UpdateUser defines what information may be provided to modify an existing
// User. All fields are optional so clients can send just the fields they want
// changed. It uses pointer fields so we can differentiate between a field that
// was not provided and a field that was provided as explicitly blank. Normally
// we do not want to use pointers to basic types but we make exceptions around
// marshalling/unmarshalling.
type UpdateComment struct {
	Body *string `json:"body" validate:"required"`
}

package user

import (
	"time"

	"github.com/jt6677/conduit-fullstack/business/data/schema"
)

// UserInfo represents an individual user.
// untrusted
type UserInfo struct {
	Id           int               `db:"user_id" json:"user_id"`
	Username     string            `db:"username" json:"username"`
	Email        string            `db:"email" json:"email"`
	PasswordHash []byte            `db:"password_hash" json:"-"`
	Password     string            `json:"password"`
	CreatedAt    time.Time         `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time         `db:"updated_at" json:"updated_at"`
	Bio          schema.NullString `db:"bio" json:"bio"`
	Image        schema.NullString `db:"image" json:"image"`
}

// TrustedUserInfo represents userInfo that is safe to return
type TrustedUserInfo struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Bio      string `json:"bio"`
	Image    string `json:"image"`
}

// NewUser contains information needed to create a new User.
type NewUser struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UpdateUser defines what information may be provided to modify an existing
// User. All fields are optional so clients can send just the fields they want
// changed. It uses pointer fields so we can differentiate between a field that
// was not provided and a field that was provided as explicitly blank. Normally
// we do not want to use pointers to basic types but we make exceptions around
// marshalling/unmarshalling.
type UpdateUser struct {
	Username        *string `json:"username"`
	Email           *string `json:"email" validate:"omitempty,email"`
	Password        *string `json:"password"`
	PasswordConfirm *string `json:"passwordConfirm" validate:"omitempty,eqfield=Password"`
}

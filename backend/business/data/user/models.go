package user

import (
	"github.com/jt6677/conduit-fullstack/business/data/schema"
)

// UserInfo represents an individual user.
// Omitedempty tags are used to omit empty fields from JSON
// Default values like 0,'',falese are ALSO ommited
// In these cases, use pointer types(*int,*string,*bool)
// Empty embedded structs will not be ommited, use pointers to them
type UserInfo struct {
	Id           string             `db:"user_id" json:"user_id,omitempty"`
	Username     string             `db:"username" json:"username,omitempty"`
	Email        string             `db:"email" json:"email,omitempty"`
	PasswordHash []byte             `db:"password_hash" json:"-"`
	Password     string             `json:"password,omitempty"`
	CreatedAt    *schema.NullTime   `db:"created_at" json:"created_at,omitempty"`
	UpdatedAt    *schema.NullTime   `db:"updated_at" json:"updated_at,omitempty"`
	Bio          *schema.NullString `db:"bio" json:"bio"`
	Image        *schema.NullString `db:"image" json:"image"`
}

// TrustedUserInfo represents userInfo that is safe to return
// type TrustedUserInfo struct {
// 	Id       string `json:"user_id"`
// 	Username string `json:"username"`
// 	Email    string `json:"email"`
// 	Bio      string `json:"bio"`
// 	Image    string `json:"image"`
// }

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

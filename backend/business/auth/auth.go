// Package auth provides authentication and authorization support.
package auth

import (
	"encoding/gob"

	gorillaSession "github.com/gorilla/sessions"
	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/data/schema"
)

// These are the expected values for Claims.Roles.
const (
	RoleAdmin = "ADMIN"
	RoleUser  = "USER"
)

type UserSession struct {
	SessionId int                `json:"session_id"` // Unique identifier.
	Username  string             `json:"username"`
	UserId    string             `json:"user_id"`
	Email     string             `json:"email,omitempty"`
	Bio       *schema.NullString `json:"bio"`
	Image     *schema.NullString `json:"image"`
}

// ctxKey represents the type of value for the context key.
type ctxKey int

// Key is used to store/retrieve a UserSesson value from a context.Context.
const Key ctxKey = 1

// userKey represents the type of user for the context key.
type userKey int

// UserValues is how request User are stored/retrieved.
const UserValues userKey = 2

type Auth struct {
	DB           *sqlx.DB
	SessionStore *gorillaSession.CookieStore
}

func init() {
	// type M map[string]interface{}
	gob.Register(&UserSession{})
}

// New creates an *Authenticator for use.
func New(db *sqlx.DB, sessionStore *gorillaSession.CookieStore) (*Auth, error) {

	a := Auth{
		DB:           db,
		SessionStore: sessionStore,
	}

	return &a, nil
}

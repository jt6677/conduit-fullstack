// Package user contains user related CRUD functionality.
package user

import (
	"context"
	"database/sql"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/foundation/database"
	"github.com/lib/pq"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
	"golang.org/x/crypto/bcrypt"
)

//Add a pepper to hash generation
var (
	// ErrNotFound is used when a specific User is requested but does not exist.
	ErrNotFound = errors.New("not found")

	// ErrAlreadyExists is used when username or email already existed.
	ErrAlreadyExists = errors.New("username or email is not avaliable")

	// ErrInvalidID occurs when an ID is not in a valid form.
	ErrInvalidId = errors.New("Id is not in its proper form")

	// ErrAuthenticationFailure occurs when a user attempts to authenticate but
	// anything goes wrong.
	ErrAuthenticationFailure = errors.New("authentication failed")

	// ErrForbidden occurs when a user tries to do something that is forbidden to them according to our access control policies.
	ErrForbidden = errors.New("attempted action is not allowed")
)

// User manages the set of API's for user access.
type User struct {
	log *log.Logger
	db  *sqlx.DB
}

// New constructs a User for api access.
func New(log *log.Logger, db *sqlx.DB) User {
	return User{
		log: log,
		db:  db,
	}
}

// Create inserts a new user into the database.
func (u User) Create(ctx context.Context, traceID string, nu NewUser, now time.Time) (UserInfo, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "internal.data.user.create")
	defer span.End()
	//Should add a pepper
	hash, err := bcrypt.GenerateFromPassword([]byte(nu.Password), bcrypt.DefaultCost)
	if err != nil {
		return UserInfo{}, errors.Wrap(err, "generating password hash")
	}

	usr := UserInfo{
		Id:           uuid.New().String(),
		Username:     nu.Username,
		Email:        nu.Email,
		PasswordHash: hash,
		CreatedAt:    schema.CreateNullTime(now.UTC()),
		UpdatedAt:    schema.CreateNullTime(now.UTC()),
	}
	// INSERT INTO users ( username, email,  password_hash, date_created, date_updated) VALUES
	// 	('123', '123@123.com',  '$2a$10$3tC6Wv/k01nzS1ktCI/iNO.iTIGNauHtRe3pJ4RrPN.Xi4DcIbChm', '2019-03-24 00:00:00', '2019-03-24 00:00:00'),
	const q = `INSERT INTO users
		(user_id,username, email, password_hash, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)`

	u.log.Printf("%s : %s : query : %s", traceID, "user.Create",
		database.Log(q, usr.Id, usr.Username, usr.Email, usr.PasswordHash, usr.CreatedAt, usr.UpdatedAt),
	)

	if _, err = u.db.ExecContext(ctx, q, usr.Id, usr.Username, usr.Email, usr.PasswordHash, usr.CreatedAt, usr.UpdatedAt); err != nil {
		// fmt.Printf("!!!!!%T,%v\n", err, err)
		pqErr := err.(*pq.Error)
		if pqErr.Code == "23505" {
			return UserInfo{}, ErrAlreadyExists
		}
		return UserInfo{}, errors.Wrap(err, "inserting user")
	}

	return usr, nil
}

// QueryByEmail gets the specified user from the database by email.
func (u User) QueryByEmail(ctx context.Context, traceID string, email string) (UserInfo, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.user.QueryByEmail")
	defer span.End()

	const q = `SELECT * FROM users WHERE email = $1`

	u.log.Printf("%s : %s : query : %s", traceID, "user.QueryByEmail",
		database.Log(q, email),
	)

	var usr UserInfo
	if err := u.db.GetContext(ctx, &usr, q, email); err != nil {
		if err == sql.ErrNoRows {
			return UserInfo{}, ErrNotFound
		}
		return UserInfo{}, errors.Wrapf(err, "user.QueryByEmail %q", email)
	}
	return usr, nil
}

// QueryById gets the specified user from the database by email.
func (u User) QueryById(ctx context.Context, traceID string, userId string) (UserInfo, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.user.QueryById")
	defer span.End()

	const q = `SELECT username,user_id email, bio, image FROM users WHERE user_id = $1`

	u.log.Printf("%s : %s : query : %s", traceID, "user.QueryById",
		database.Log(q, userId),
	)

	var usr UserInfo
	// var trustedUserInfo TrustedUserInfo
	if err := u.db.GetContext(ctx, &usr, q, userId); err != nil {
		if err == sql.ErrNoRows {
			return UserInfo{}, ErrNotFound
		}
		return UserInfo{}, errors.Wrapf(err, "user.QueryById %q", userId)
	}
	// trustedUserInfo := TrustedUserInfo{
	// 	Email:    usr.Email,
	// 	Username: usr.Username,
	// 	Bio:      usr.Bio.String,
	// 	Image:    usr.Image.String,
	// }
	return usr, nil
}

// QueryById gets the specified user from the database by email.
func (u User) QueryByUsername(ctx context.Context, traceID string, username string) (UserInfo, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.user.QueryByUsername")
	defer span.End()

	const q = `SELECT username,user_id, email, bio, image FROM users WHERE username = $1`

	u.log.Printf("%s : %s : query : %s", traceID, "user.QueryByUsername",
		database.Log(q, username),
	)
	var usr UserInfo
	if err := u.db.GetContext(ctx, &usr, q, username); err != nil {
		if err == sql.ErrNoRows {
			return UserInfo{}, ErrNotFound
		}
		return UserInfo{}, errors.Wrapf(err, "user.QueryByUsername %q", username)
	}
	// trustedUserInfo := TrustedUserInfo{
	// 	Username: usr.Username,
	// 	Email:    usr.Email,
	// 	Bio:      usr.Bio.String,
	// 	Image:    usr.Image.String,
	// }
	return usr, nil
}

// Authenticate finds a user by their email and verifies their password. On
// success it returns a Claims UserInfo representing this user. The claims can be
// used to generate a token for future authentication.
func (u User) Authenticate(ctx context.Context, traceID string, emailorusername, password string) (UserInfo, error) {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.user.authenticate")
	// defer span.End()
	var q string
	if strings.Contains(emailorusername, "@") {
		q = `SELECT username, user_id, email, bio, image, password_hash FROM users WHERE email = $1`
	} else {
		q = `SELECT username, user_id, email, bio, image, password_hash FROM users WHERE username = $1`
	}
	u.log.Printf("%s : %s : query : %s", traceID, "user.Authenticate",
		database.Log(q, emailorusername),
	)

	var user UserInfo
	if err := u.db.GetContext(ctx, &user, q, emailorusername); err != nil {

		// Normally we would return ErrNotFound in this scenario but we do not want
		// to leak to an unauthenticated user which emails are in the system.
		if err == sql.ErrNoRows {
			return UserInfo{}, ErrAuthenticationFailure
		}

		return UserInfo{}, errors.Wrap(err, "selecting single user")
	}
	// fmt.Println(user.PasswordHash)
	// Compare the provided password with the saved hash. Use the bcrypt
	// comparison function so it is cryptographically secure.
	if err := bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(password)); err != nil {
		return UserInfo{}, err
	}

	// userSession := auth.UserSession{
	// 	UserId:   user.Id,
	// 	Username: user.Username,
	// }

	return user, nil
}

package mid

import (
	"context"
	"net/http"

	"github.com/gorilla/sessions"
	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

//To Do add User Validation with DB query

// Authenticate validates a JWT from the `Authorization` header.
func Authenticate(a *auth.Auth) web.Middleware {

	// This is the actual middleware function to be executed.
	m := func(handler web.Handler) web.Handler {

		// Create the handler that will be attached in the middleware chain.
		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
			ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.mid.authenticate")
			defer span.End()

			//To Do add User Validation with DB query
			// Validate User.
			session, err := a.SessionStore.Get(r, "session")
			if err != nil {
				c := &http.Cookie{
					Name:     "session",
					Value:    "",
					Path:     "/",
					MaxAge:   -1,
					HttpOnly: true,
				}

				http.SetCookie(w, c)
				return web.NewRequestError(errors.Wrap(err, "Cookie Invalid"), http.StatusUnauthorized)

			}
			//User is not logged in, just return early
			if session.IsNew {
				// return web.NewRequestError(errors.New("User Not Logged In"), http.StatusUnauthorized)
				// fmt.Println("a ...interface{} NOOOOOOO")
				return handler(ctx, w, r)
			}
			session.Options = &sessions.Options{
				Path:     "/",
				MaxAge:   86400 * 7,
				HttpOnly: true,
			}
			err = session.Save(r, w)
			if err != nil {
				return web.NewRequestError(errors.Wrap(err, "Saving Cookie Failed"), http.StatusUnauthorized)
			}
			// Retrieve our struct and type-assert it
			// if no user, just return early
			user, ok := session.Values["activeUser"].(*auth.UserSession)
			if !ok {

				// return web.NewRequestError(errors.New("type assertion failed"), http.StatusUnauthorized)
				return handler(ctx, w, r)

			}

			// Add claims to the context so they can be retrieved later.
			ctx = context.WithValue(ctx, auth.UserValues, user)

			return handler(ctx, w, r)
		}

		return h
	}

	return m
}

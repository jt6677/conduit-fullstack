package handlers

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/user"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

type userGroup struct {
	user user.User
	auth *auth.Auth
}

func (ug userGroup) signup(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.user.update")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}

	var nu user.NewUser
	if err := web.Decode(r, &nu); err != nil {
		return errors.Wrap(err, "Decode error")
	}

	_, err := ug.user.Create(ctx, v.TraceID, nu, v.Now)
	if err != nil {
		return web.NewRequestError(err, http.StatusBadRequest)
	}
	//Authenticate
	signInUsr, err := ug.user.Authenticate(ctx, v.TraceID, nu.Email, nu.Password)
	if err != nil {
		switch err {
		case user.ErrAuthenticationFailure:
			return web.NewRequestError(err, http.StatusUnauthorized)
		default:
			return errors.Wrap(err, "authenticating")
		}
	}
	return ug.signInWithSession(ctx, w, r, &signInUsr)
}

func (ug userGroup) signin(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.user.update")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}

	var nu user.UserInfo
	if err := web.Decode(r, &nu); err != nil {
		return errors.Wrap(err, "")
	}
	//Authenticate
	usr, err := ug.user.Authenticate(ctx, v.TraceID, nu.Email, nu.Password)
	if err != nil {
		switch err {
		case user.ErrAuthenticationFailure:
			return web.NewRequestError(err, http.StatusUnauthorized)
		default:
			return errors.Wrap(err, "authenticating")
		}
	}
	return ug.signInWithSession(ctx, w, r, &usr)
}

//isLogin checks if user is logged in
//mid.Authenticate verifies cookie "session" and put a UserSession in ctx
//isLogin pulls UserSession out of ctx and type asert it
//or response with nil
func (ug userGroup) isLogin(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.user.update")
	defer span.End()
	// v, ok := ctx.Value(web.KeyValues).(*web.Values)
	// if !ok {
	// 	return web.NewShutdownError("web value missing from context")
	// }

	if temp := ctx.Value(auth.UserValues); temp != nil {
		if usr, ok := temp.(*auth.UserSession); ok {
			return web.Respond(ctx, w, usr, http.StatusOK)
		}
	}
	return web.Respond(ctx, w, nil, http.StatusUnauthorized)
}

//Sessions
func (ug userGroup) signInWithSession(ctx context.Context, w http.ResponseWriter, r *http.Request, usr *user.UserInfo) error {

	userSession := auth.UserSession{
		UserId:   usr.Id,
		Username: usr.Username,
		Email:    usr.Email,
		Bio:      usr.Bio,
		Image:    usr.Image,
	}

	session, _ := ug.auth.SessionStore.Get(r, "session")

	session.Values["activeUser"] = userSession
	err := session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.Wrapf(err, "User: %+v", &usr)
	}
	return web.Respond(ctx, w, usr, http.StatusCreated)
}

func (ug userGroup) signout(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	session, _ := ug.auth.SessionStore.Get(r, "session")
	//expires session
	session.Options.MaxAge = -1
	err := session.Save(r, w)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return errors.Wrapf(err, "Logging out")
	}
	//expires session cookie in user's client
	http.SetCookie(w, &http.Cookie{Name: "session", MaxAge: -1})
	// http.SetCookie(w, &http.Cookie{Name: "_gorilla_csrf", MaxAge: -1})
	return web.Respond(ctx, w, "Signout Successful", http.StatusOK)
}

//profile returns user profile with name coming from ulr params
func (ug userGroup) profile(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	vars := web.Params(r)
	username := vars["username"]
	fmt.Println(username)
	trustedUserInfo, err := ug.user.QueryByUsername(ctx, v.TraceID, username)
	if err != nil {
		return errors.Wrapf(err, "Query User By Username")
	}

	return web.Respond(ctx, w, trustedUserInfo, http.StatusOK)
}

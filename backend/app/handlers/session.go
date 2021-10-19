package handlers

import (
	"context"
	"fmt"
	"strconv"

	"net/http"

	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/session"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"github.com/pkg/errors"
)

type sessionGroup struct {
	session session.Session
	auth    *auth.Auth
}

//QueryArticleByID returns article with id from url
func (sg sessionGroup) recordSession(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.session.RecordSession")
	// defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("UserValues missing from context"), http.StatusInternalServerError)

	}

	var sessionJSON session.SessionInfo
	err := web.Decode(r, &sessionJSON)
	if err != nil {
		return web.NewRequestError(err, http.StatusInternalServerError)
	}
	sessionJSON.UserID = u.UserID
	sessionJSON.DateID, err = sg.session.DateIDGenerate()
	if err != nil {
		return web.NewRequestError(err, http.StatusInternalServerError)
	}
	fmt.Println("time:", sessionJSON.Started)

	err = sg.session.CreateSession(ctx, v.TraceID, sessionJSON)
	if err != nil {
		return web.NewRequestError(err, http.StatusInternalServerError)
	}
	return web.Respond(ctx, w, "Successfully Recorded currentSession", http.StatusOK)
}

//QueryByArticleTitle returns article with name from url
func (ag sessionGroup) querySessionByUserIDandDateID(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	// defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	vars := web.Params(r)
	dateIDString := vars["id"]
	dateID, err := strconv.Atoi(dateIDString)
	if err != nil {
		return web.NewRequestError(err, http.StatusInternalServerError)
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("UserValues missing from context"), http.StatusInternalServerError)

	}
	sessions, err := ag.session.QuerySessionByUserIDandDateID(ctx, v.TraceID, u.UserID, dateID)
	if err != nil {
		return web.NewRequestError(err, http.StatusInternalServerError)

	}
	return web.Respond(ctx, w, sessions, http.StatusOK)
}

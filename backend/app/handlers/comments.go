package handlers

import (
	"context"
	"net/http"

	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/comments"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

type commentsGroup struct {
	comments comments.Comments
	auth     *auth.Auth
}

func (cg commentsGroup) insertComment(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.comments.insertComment")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}
	var nc comments.Comment
	if err := web.Decode(r, &nc); err != nil {
		return errors.Wrap(err, "Decode error")
	}
	nc.CommenterId = u.UserId
	insertedComment, err := cg.comments.InsertComment(ctx, v.TraceID, v.Now, nc)
	if err != nil {
		return errors.Wrapf(err, "Inserting Comment")
	}
	return web.Respond(ctx, w, insertedComment, http.StatusOK)
}
func (cg commentsGroup) getComments(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.comments.getComments")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	var nc comments.Comment
	if err := web.Decode(r, &nc); err != nil {
		return errors.Wrap(err, "Decode error")
	}
	comments, err := cg.comments.GetComments(ctx, v.TraceID, nc.ArticleId)
	if err != nil {
		return errors.Wrapf(err, "handlers.comments.getComments ")
	}
	return web.Respond(ctx, w, comments, http.StatusOK)
}
func (cg commentsGroup) deleteComment(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.comments.deleteComment")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}
	var nc comments.Comment
	if err := web.Decode(r, &nc); err != nil {
		return errors.Wrap(err, "Decode error")
	}
	err := cg.comments.DeleteComment(ctx, v.TraceID, nc.ArticleId, nc.Id, u.UserId)
	if err != nil {
		return errors.Wrapf(err, "handlers.comments.deleteComment ")
	}
	return web.Respond(ctx, w, "Successfully deleted comment", http.StatusOK)
}

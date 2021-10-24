package handlers

import (
	"context"
	"net/http"

	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/articles"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

type articlesGroup struct {
	articles articles.Articles
	auth     *auth.Auth
}

func (ag articlesGroup) insertArticle(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.articles.insertArticle")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	var na articles.Article
	if err := web.Decode(r, &na); err != nil {
		return errors.Wrap(err, "Decode error")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("UserValues missing from context"), http.StatusUnauthorized)

	}
	slug, err := ag.articles.InsertArticle(ctx, v.TraceID, na, u.UserId)
	if err != nil {
		return errors.Wrapf(err, "Inserting Article")
	}
	return web.Respond(ctx, w, slug, http.StatusOK)
}

func (ag articlesGroup) queryArticleWithSlug(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.queryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	vars := web.Params(r)
	slug := vars["slug"]
	article, err := ag.articles.QueryArticleBySlug(ctx, v.TraceID, slug)
	if err != nil {
		return errors.Wrapf(err, "Query Article")
	}
	return web.Respond(ctx, w, article, http.StatusOK)
}

func (ag articlesGroup) queryArticles(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}

	articles, err := ag.articles.QueryArticles(ctx, v.TraceID)
	if err != nil {
		return errors.Wrapf(err, "Query Articles")
	}
	return web.Respond(ctx, w, articles, http.StatusOK)
}
func (ag articlesGroup) queryArticlesByUser(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}

	if temp := ctx.Value(auth.UserValues); temp != nil {
		if usr, ok := temp.(*auth.UserSession); ok {
			articles, err := ag.articles.QueryArticlesByUser(ctx, v.TraceID, usr.UserId)
			if err != nil {
				return errors.Wrapf(err, "Query Articles By User")
			}
			return web.Respond(ctx, w, articles, http.StatusOK)
		}
	}
	return errors.New("Query Articles By User")
}

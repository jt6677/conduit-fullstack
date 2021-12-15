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
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}
	var na articles.Article
	if err := web.Decode(r, &na); err != nil {
		return errors.Wrap(err, "Decode error")
	}

	slug, err := ag.articles.InsertArticle(ctx, v.TraceID, na, u.UserId)
	if err != nil {
		return errors.Wrapf(err, "Inserting Article")
	}
	return web.Respond(ctx, w, slug, http.StatusOK)
}
func (ag articlesGroup) deleteArticle(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.articles.insertArticle")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}

	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}
	slug := web.Params(r)["slug"]
	err := ag.articles.DeleteArticle(ctx, v.TraceID, slug, u.UserId)
	if err != nil {
		return web.NewRequestError(errors.New("Failed to delete article"), http.StatusBadRequest)
	}
	return web.Respond(ctx, w, "Successfully Deleted Article", http.StatusOK)
}

func (ag articlesGroup) updateArticle(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.queryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}
	var na articles.Article
	if err := web.Decode(r, &na); err != nil {
		return errors.Wrap(err, "Decode error")
	}
	preArticleSlug := web.Params(r)["slug"]

	slug, err := ag.articles.UpdateArticle(ctx, v.TraceID, preArticleSlug, na, u.UserId)
	if err != nil {
		return web.NewRequestError(errors.New("Failed to Update Article"), http.StatusBadRequest)
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
	slug := web.Params(r)["slug"]
	//default user not signed in
	var userId = "not-signed-in"
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	//ok means user is signed in
	if ok {
		userId = u.UserId
	}

	article, err := ag.articles.QueryArticleBySlug(ctx, v.TraceID, slug, userId)
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
	//default user not signed in
	var userId = "not-signed-in"
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	//ok means user is signed in
	if ok {
		userId = u.UserId
	}

	articles, err := ag.articles.QueryArticles(ctx, v.TraceID, userId)
	if err != nil {
		return errors.Wrapf(err, "Query Articles")
	}
	return web.Respond(ctx, w, articles, http.StatusOK)
	// if !ok {
	// 	articles, err := ag.articles.QueryArticles(ctx, v.TraceID, u.UserId)
	// 	if err != nil {
	// 		return errors.Wrapf(err, "Query All Articles")
	// 	}
	// 	return web.Respond(ctx, w, articles, http.StatusOK)
	// } else {
	// 	articles, err := ag.articles.QueryArticles(ctx, v.TraceID, u.UserId)
	// 	if err != nil {
	// 		return errors.Wrapf(err, "Query Articles")
	// 	}
	// 	return web.Respond(ctx, w, articles, http.StatusOK)
	// }
}

func (ag articlesGroup) queryArticlesByUser(ctx context.Context, w http.ResponseWriter, r *http.Request) error {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	} else {
		articles, err := ag.articles.QueryArticlesByUser(ctx, v.TraceID, u.UserId, u.UserId)
		if err != nil {
			return errors.Wrapf(err, "Query Articles By User")
		}
		return web.Respond(ctx, w, articles, http.StatusOK)
	}
}

func (ag articlesGroup) favorite(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	vars := web.Params(r)
	slug := vars["slug"]

	usr, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)

	}

	favoritedArticle, err := ag.articles.AddFavorite(ctx, v.TraceID, usr.UserId, slug)
	if err != nil {
		return errors.Wrapf(err, "Add Favorite ")
	}

	return web.Respond(ctx, w, favoritedArticle, http.StatusOK)
}
func (ag articlesGroup) unfavorite(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.article.QueryArticleByID")
	defer span.End()

	v, ok := ctx.Value(web.KeyValues).(*web.Values)
	if !ok {
		return web.NewShutdownError("web value missing from context")
	}
	vars := web.Params(r)
	slug := vars["slug"]

	usr, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	if !ok {
		return web.NewRequestError(errors.New("User is not logged in"), http.StatusUnauthorized)
	}

	favoritedArticle, err := ag.articles.DeleteFavorite(ctx, v.TraceID, usr.UserId, slug)
	if err != nil {
		return errors.Wrapf(err, "Add Favorite ")
	}

	return web.Respond(ctx, w, favoritedArticle, http.StatusOK)
}

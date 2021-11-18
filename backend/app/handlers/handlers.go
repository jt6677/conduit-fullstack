package handlers

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/csrf"
	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/articles"
	"github.com/jt6677/conduit-fullstack/business/data/user"
	"github.com/jt6677/conduit-fullstack/business/mid"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"go.opentelemetry.io/otel/api/trace"
)

// API constructs an http.Handler with all application routes defined.
func API(build string, csrfAuthKey string, shutdown chan os.Signal, db *sqlx.DB, log *log.Logger, a *auth.Auth) http.Handler {

	// =========================================================================
	// Construct the web.App which holds all routes as well as common Middleware.
	app := web.NewApp(shutdown, mid.Logger(log), mid.Errors(log), mid.Metrics(), mid.Panics(log))

	// =========================================================================
	//Register a subRouter with "/api" pathPrefix
	//Create a csrf middleware and attach to that subRouter
	api := app.Subrouter("/api")
	// api := app.Subrouter("/api")
	// csrfMiddleware := csrf.Protect([]byte(csrfAuthKey), csrf.Secure(false))
	csrfMiddleware := csrf.Protect([]byte(csrfAuthKey), csrf.Secure(false), csrf.SameSite(csrf.SameSiteStrictMode), csrf.Path("/"))
	api.Use(csrfMiddleware)
	app.HandleSubRouter(api, http.MethodGet, "/csrf", CsrfTokenResponse)
	app.Handle(http.MethodGet, "/api/csrf", CsrfTokenResponse)
	app.Handle(http.MethodGet, "/csrf", CsrfTokenResponse)

	// =========================================================================
	// Register health check endpoint. This route is not authenticated.
	// cg := checkGroup{
	// 	build: build,
	// 	db:    db,
	// }
	// app.Handle(http.MethodGet, "/v1/readiness", cg.readiness)
	// app.Handle(http.MethodGet, "/v1/liveness", cg.liveness)

	// =========================================================================
	//Register user management and authentication endpoints.
	ug := userGroup{
		user: user.New(log, db),
		auth: a,
	}
	app.HandleSubRouter(api, http.MethodGet, "/me", ug.isLogin, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodPost, "/signup", ug.signup)
	app.HandleSubRouter(api, http.MethodPost, "/signin", ug.signin)
	app.HandleSubRouter(api, http.MethodGet, "/signout", ug.signout, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodGet, "/profiles/{username:[a-zA-Z0-9]+}", ug.profile)

	// =========================================================================
	//Register session endpoints.
	ag := articlesGroup{
		articles: articles.New(log, db),
		auth:     a,
	}
	// app.Handle(http.MethodPost, "/api/articles", ag.insertArticle, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodPost, "/articles", ag.insertArticle, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodGet, "/article/{slug:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$}", ag.queryArticleWithSlug, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodPost, "/article/{slug}/favorite", ag.favorite, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodDelete, "/article/{slug}/unfavorite", ag.unfavorite, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodGet, "/articles/all", ag.queryArticles, mid.Authenticate(a))
	app.HandleSubRouter(api, http.MethodGet, "/articles/myfeed", ag.queryArticlesByUser, mid.Authenticate(a))

	return app
}

func CsrfTokenResponse(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.csrf")
	defer span.End()
	type csrfResponse struct {
		CsrfToken string `json:"csrfToken"`
	}
	token := csrfResponse{
		CsrfToken: csrf.Token(r),
	}
	return web.Respond(ctx, w, token, http.StatusOK)
}

package handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/articles"
	"github.com/jt6677/conduit-fullstack/business/data/user"
	"github.com/jt6677/conduit-fullstack/business/mid"
	"github.com/jt6677/conduit-fullstack/foundation/web"
)

// API constructs an http.Handler with all application routes defined.
func API(build string, maxMultipartMem int, shutdown chan os.Signal, db *sqlx.DB, log *log.Logger, a *auth.Auth) http.Handler {

	// Construct the web.App which holds all routes as well as common Middleware.
	app := web.NewApp(shutdown, mid.Logger(log), mid.Errors(log), mid.Metrics(), mid.Panics(log))
	// =========================================================================
	//csrf Response
	// app.Handle(http.MethodGet, "/api/csrf", csrfResponse)

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
	app.Handle(http.MethodGet, "/api/me", ug.isLogin, mid.Authenticate(a))
	app.Handle(http.MethodPost, "/api/signup", ug.signup)
	app.Handle(http.MethodPost, "/api/signin", ug.signin)
	app.Handle(http.MethodGet, "/api/signout", ug.signout, mid.Authenticate(a))
	app.Handle(http.MethodGet, "/api/profiles/{username:[a-zA-Z0-9]+}", ug.profile)

	// =========================================================================
	//Register session endpoints.
	ag := articlesGroup{
		articles: articles.New(log, db),
		auth:     a,
	}
	app.Handle(http.MethodPost, "/api/articles", ag.insertArticle, mid.Authenticate(a))
	app.Handle(http.MethodGet, "/api/article/{slug:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$}", ag.queryArticleWithSlug, mid.Authenticate(a))
	app.Handle(http.MethodGet, "/api/articles/all", ag.queryArticles)
	app.Handle(http.MethodGet, "/api/articles/myfeed", ag.queryArticlesByUser, mid.Authenticate(a))

	return app
}

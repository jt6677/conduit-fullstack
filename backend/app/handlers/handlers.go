package handlers

import (
	"log"
	"net/http"
	"os"

	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/fileMange"
	"github.com/jt6677/conduit-fullstack/business/data/session"
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

	// =========================================================================
	//Register session endpoints.
	ss := sessionGroup{
		session: session.New(log, db),
		auth:    a,
	}
	app.Handle(http.MethodPost, "/api/recordsession", ss.recordSession, mid.Authenticate(a))
	app.Handle(http.MethodPost, "/api/dailysession/{id:[0-9]+}", ss.querySessionByUserIDandDateID, mid.Authenticate(a))

	// =========================================================================
	//Register fileMange endpoints.
	fm := fileMangeGroup{
		fileMange: fileMange.New(log, &maxMultipartMem),
		auth:      a,
	}
	uploadedFilePath := "./uploadedfiles"
	fileHandler := http.FileServer(http.Dir(uploadedFilePath))
	app.FileServer("/api/files/", "/api/files/", fileHandler)
	app.Handle(http.MethodPost, "/api/upload", fm.handleUpload)
	return app
}

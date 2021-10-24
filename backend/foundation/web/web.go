// Package Web contains a small web framer work extention.
//web wraps ctx and Gorilla mux with customized function
package web

//turn off csrfMw for development
import (
	"context"
	"net/http"
	"os"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	othttp "go.opentelemetry.io/contrib/instrumentation/net/http"
	"go.opentelemetry.io/otel/api/trace"
)

// ctxKey represents the type of value for the context key.
type ctxKey int

// KeyValues is how request values are stored/retrieved.
const KeyValues ctxKey = 1

// Values represent state for each request.
type Values struct {
	TraceID    string
	Now        time.Time
	StatusCode int
}

// A Handler is a type that handles an http request within our own little mini
// framework.
type Handler func(ctx context.Context, w http.ResponseWriter, r *http.Request) error

type App struct {
	mux      *mux.Router
	otmux    http.Handler
	shutdown chan os.Signal
	mw       []Middleware
}

func NewApp(shutdown chan os.Signal, mw ...Middleware) *App {
	r := mux.NewRouter()
	// turn off csrfMw for development
	// b := make([]byte, 32)
	// _, _ = rand.Read(b)
	// csrfMw := csrf.Protect(b, csrf.SameSite(csrf.SameSiteStrictMode))
	// r.Use(csrfMw)
	app := App{
		mux:      r,
		shutdown: shutdown,
		mw:       mw,
	}
	app.otmux = othttp.NewHandler(app.mux, "request")
	return &app
}

// Handle is our mechanism for mounting Handlers for a given HTTP verb and path
// pair, this makes for really easy, convenient routing.
func (a *App) Handle(method string, path string, handler Handler, mw ...Middleware) {

	// First wrap handler specific middleware around this handler.
	handler = wrapMiddleware(mw, handler)

	// Add the application's general middleware to the handler chain.
	handler = wrapMiddleware(a.mw, handler)

	// The function to execute for each request.
	h := func(w http.ResponseWriter, r *http.Request) {

		// Start or expand a distributed trace.
		ctx := r.Context()
		ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, r.URL.Path)
		defer span.End()

		// Set the context with the required values to
		// process the request.
		v := Values{
			// TraceID: "need to be fixed",
			TraceID: span.SpanContext().TraceID.String(),
			Now:     time.Now(),
		}
		ctx = context.WithValue(ctx, KeyValues, &v)

		// Call the wrapped handler functions.
		if err := handler(ctx, w, r); err != nil {
			a.SignalShutdown()
			return
		}
	}

	// Add this handler for the specified verb and route.
	a.mux.HandleFunc(path, h).Methods(method)
}

// SignalShutdown is used to gracefully shutdown the app when an integrity
// issue is identified.
func (a *App) SignalShutdown() {
	a.shutdown <- syscall.SIGTERM
}

// ServeHTTP implements the http.Handler interface. It's the entry point for
// all http traffic and allows the opentelemetry mux to run first to handle
// tracing. The opentelemetry mux then calls the application mux to handle
// application traffic. This was setup on line 57 in the NewApp function.
func (a *App) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// nosurf.New(app)
	a.otmux.ServeHTTP(w, r)
}

//Subrouter creates a subrouter with given pathprefix
//it implements the gorilla mux.PathPrefix(pathPrefix).Subrouter()
func (a *App) Subrouter(pathPrefix string) *mux.Router {
	return a.mux.PathPrefix(pathPrefix).Subrouter()
}

// HandleSubRouter is our mechanism for mounting Handlers to a subrouter
//for a given HTTP verb and path
// pair, this makes for really easy, convenient routing.
func (a *App) HandleSubRouter(subrouter *mux.Router, method string, path string, handler Handler, mw ...Middleware) {

	// First wrap handler specific middleware around this handler.
	handler = wrapMiddleware(mw, handler)

	// Add the application's general middleware to the handler chain.
	handler = wrapMiddleware(a.mw, handler)

	// The function to execute for each request.
	h := func(w http.ResponseWriter, r *http.Request) {

		// Start or expand a distributed trace.
		ctx := r.Context()
		ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, r.URL.Path)
		defer span.End()

		// Set the context with the required values to
		// process the request.
		v := Values{
			// TraceID: "need to be fixed",
			TraceID: span.SpanContext().TraceID.String(),
			Now:     time.Now(),
		}
		ctx = context.WithValue(ctx, KeyValues, &v)

		// Call the wrapped handler functions.
		if err := handler(ctx, w, r); err != nil {
			a.SignalShutdown()
			return
		}
	}

	// Add this handler for the specified verb and route.
	// to a specific router
	subrouter.HandleFunc(path, h).Methods(method)
}

//FileServer register handler with provided pathPrefix and stripPrefix
func (a *App) FileServer(pathPrefix string, stripPrefix string, fileHandler http.Handler) {
	a.mux.PathPrefix(pathPrefix).Handler(http.StripPrefix(stripPrefix, fileHandler))
}

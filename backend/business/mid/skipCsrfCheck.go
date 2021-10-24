package mid

import (
	"context"
	"net/http"

	"github.com/gorilla/csrf"
	"github.com/jt6677/conduit-fullstack/foundation/web"
	"go.opentelemetry.io/otel/api/trace"
)

//  SkipCsrfCheck skips csrf validation
func SkipCsrfCheck() web.Middleware {

	// This is the actual middleware function to be executed.
	m := func(handler web.Handler) web.Handler {

		// Create the handler that will be attached in the middleware chain.
		h := func(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
			ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.mid.authenticate")
			defer span.End()

			// r = csrf.UnsafeSkipCheck(r)

			return handler(ctx, w, csrf.UnsafeSkipCheck(r))
		}

		return h
	}

	return m
}

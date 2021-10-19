package handlers

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/fileMange"
	"github.com/jt6677/conduit-fullstack/foundation/web"
)

type fileMangeGroup struct {
	fileMange fileMange.FileMange
	auth      *auth.Auth
}

func (ig fileMangeGroup) handleUpload(ctx context.Context, w http.ResponseWriter, r *http.Request) error {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "handlers.session.RecordSession")
	// defer span.End()

	// v, ok := ctx.Value(web.KeyValues).(*web.Values)
	// if !ok {
	// 	return web.NewShutdownError("web value missing from context")
	// }
	// u, ok := ctx.Value(auth.UserValues).(*auth.UserSession)
	// if !ok {
	// 	return web.NewRequestError(errors.New("UserValues missing from context"), http.StatusInternalServerError)
	// }

	err := r.ParseMultipartForm(int64(*ig.fileMange.MaxMultipartMem))
	if err != nil {
		// fmt.Println("ssssseror!")
		return web.NewRequestError(err, http.StatusInternalServerError)
	}
	files := r.MultipartForm.File["file"]
	for _, f := range files {
		fmt.Println("incoming files:", f.Filename)
		// Open the uploaded file
		file, err := f.Open()
		if err != nil {
			return web.NewRequestError(err, http.StatusInternalServerError)
		}
		defer file.Close()
		err = ig.fileMange.Create(file, f.Filename)
		if err != nil {
			fmt.Println(err)
			return web.NewRequestError(err, http.StatusInternalServerError)
		}
	}
	w.Write([]byte("Successfully upload images"))
	return nil

}

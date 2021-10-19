package main

import (
	"context"
	"expvar"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ardanlabs/conf"
	"github.com/gorilla/sessions"
	"github.com/jt6677/conduit-fullstack/app/handlers"
	"github.com/jt6677/conduit-fullstack/business/auth"
	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/foundation/database"
	"github.com/pkg/errors"
)

var build = "Conduit-React-TS-Tailwind-Golang"

func main() {
	log := log.New(os.Stdout, "conduit-fullstack: ", log.LstdFlags|log.Lmicroseconds|log.Lshortfile)
	if err := run(log); err != nil {
		log.Println("main: error:", err)
		os.Exit(1)
	}
}

func run(log *log.Logger) error {

	var cfg struct {
		conf.Version
		Web struct {
			// APIHost         string        `conf:"default:0.0.0.0:3000"`
			APIHost         string        `conf:"default:localhost:8080"`
			DebugHost       string        `conf:"default:0.0.0.0:4000"`
			ReadTimeout     time.Duration `conf:"default:20s"`
			WriteTimeout    time.Duration `conf:"default:20s"`
			ShutdownTimeout time.Duration `conf:"default:10s"`
			SessionSecret   string        `conf:"default:lfgggg"`
			MaxMultipartMem int           `conf:"default:2048576"`
		}
		DB struct {
			User       string `conf:"default:postgres"`
			Password   string `conf:"default:123321,noprint"`
			Host       string `conf:"default:localhost"`
			Name       string `conf:"default:conduit"`
			DisableTLS bool   `conf:"default:true"`
		}
	}
	cfg.Version.SVN = build
	cfg.Version.Desc = "Go Forward with Conduit!"
	if err := conf.Parse(os.Args[1:], "SALES", &cfg); err != nil {
		switch err {
		case conf.ErrHelpWanted:
			usage, err := conf.Usage("SALES", &cfg)
			if err != nil {
				return errors.Wrap(err, "generating config usage")
			}
			fmt.Println(usage)
			return nil
		case conf.ErrVersionWanted:
			version, err := conf.VersionString("SALES", &cfg)
			if err != nil {
				return errors.Wrap(err, "generating config version")
			}
			fmt.Println(version)
			return nil
		}
		return errors.Wrap(err, "parsing config")
	}
	// =========================================================================
	// App Starting

	// Print the build version for our logs. Also expose it under /debug/vars.
	expvar.NewString("build").Set(build)
	log.Printf("main: Started : Application initializing : version %q", build)
	defer log.Println("main: Completed")

	out, err := conf.String(&cfg)
	if err != nil {
		return errors.Wrap(err, "generating config for output")
	}
	log.Printf("main: Config  :\n%v\n", out)

	//=========================================================================
	// Start Database

	log.Println("main: Initializing database support")

	db, err := database.Open(database.Config{
		User:       cfg.DB.User,
		Password:   cfg.DB.Password,
		Host:       cfg.DB.Host,
		Name:       cfg.DB.Name,
		DisableTLS: cfg.DB.DisableTLS,
	})
	if err != nil {
		return errors.Wrap(err, "connecting to db")
	}
	ctx := context.Background()
	err = database.StatusCheck(ctx, db)
	if err != nil {
		return errors.Wrap(err, "connecting to db")
	}

	err = schema.Migrate(db)
	if err != nil {
		return errors.Wrap(err, "miragating db")
	}
	// err = schema.Seed(db)
	// if err != nil {
	// 	return errors.Wrap(err, "seeding to db")
	// }
	// fmt.Println("seeding finished")
	// err = schema.DeleteAll(db)
	// if err != nil {
	// 	return errors.Wrap(err, "delete datat in all tables")
	// }
	// fmt.Println("deleting finished")
	defer func() {
		log.Printf("main: Database Stopping : %s", cfg.DB.Host)
		db.Close()
	}()

	// =========================================================================
	// Initialize authentication support
	var store = sessions.NewCookieStore([]byte(cfg.Web.SessionSecret))
	auth, err := auth.New(db, store)
	if err != nil {
		return errors.Wrap(err, "constructing auth")
	}

	// // =========================================================================
	// Start API Service

	log.Println("main: Initializing API support")

	// Make a channel to listen for an interrupt or terminate signal from the OS.
	// Use a buffered channel because the signal package requires it.
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	api := http.Server{
		Addr:         cfg.Web.APIHost,
		Handler:      handlers.API(build, cfg.Web.MaxMultipartMem, shutdown, db, log, auth),
		ReadTimeout:  cfg.Web.ReadTimeout,
		WriteTimeout: cfg.Web.WriteTimeout,
	}

	// Make a channel to listen for errors coming from the listener. Use a
	// buffered channel so the goroutine can exit if we don't collect this error.
	serverErrors := make(chan error, 1)

	// Start the service listening for requests.
	go func() {
		log.Printf("main: API listening on %s", api.Addr)
		serverErrors <- api.ListenAndServe()
	}()
	// =========================================================================
	// Shutdown

	// Blocking main and waiting for shutdown.
	select {
	case err := <-serverErrors:
		return errors.Wrap(err, "server error")

	case sig := <-shutdown:
		log.Printf("main: %v : Start shutdown", sig)

		// Give outstanding requests a deadline for completion.
		ctx, cancel := context.WithTimeout(context.Background(), cfg.Web.ShutdownTimeout)
		defer cancel()

		// Asking listener to shutdown and shed load.
		if err := api.Shutdown(ctx); err != nil {
			api.Close()
			return errors.Wrap(err, "could not stop server gracefully")
		}
	}

	return nil
}

package session

import (
	"context"
	"log"
	"strconv"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/foundation/database"
	"github.com/pkg/errors"
)

var (
	// ErrNotFound is used when a specific User is requested but does not exist.
	ErrNotFound = errors.New("not found")
)

type Session struct {
	log *log.Logger
	db  *sqlx.DB
}

func New(log *log.Logger, db *sqlx.DB) Session {
	return Session{
		log: log,
		db:  db,
	}
}

// CreateSession creates a session with SessionInfo
func (s Session) CreateSession(ctx context.Context, traceID string, si SessionInfo) error {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.createarticleaction")
	// defer span.End()

	const q = `INSERT INTO sessions
				(user_id, date_id,started,finished)
				VALUES ($1, $2,$3, CURRENT_TIMESTAMP)`

	s.log.Printf("%s : %s : query : %s", traceID, "user.CreateArticleAction",
		database.Log(q, si.UserID, si.DateID, si.Started, time.Now()),
	)

	if _, err := s.db.ExecContext(ctx, q, si.UserID, si.DateID, si.Started); err != nil {
		return errors.Wrapf(err, "creating session UserID=%v DateID=%v Finished=%v", si.UserID, si.DateID, si.Started)
	}
	return nil

}

// QuerySessionByUserID gets all sessionInfo from one user with userID.
func (a Session) QuerySessionByUserID(ctx context.Context, traceID string, userID int) ([]SessionInfo, error) {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QuerySessionByUserID")
	// defer span.End()

	const q = `SELECT * from sessions WHERE user_id =$1`

	a.log.Printf("%s : %s : query : %s", traceID, "session.QuerySessionByUserID",
		database.Log(q, userID),
	)

	sessioninfo := []SessionInfo{}
	if err := a.db.SelectContext(ctx, &sessioninfo, q, userID); err != nil {
		return nil, errors.Wrapf(err, "selecting sessionInfo")
	}

	return sessioninfo, nil
}

// QuerySessionByUserIDandDateID gets all sessionInfo with UserID and DateID.
func (a Session) QuerySessionByUserIDandDateID(ctx context.Context, traceID string, userID int, dateID int) ([]SessionInfo, error) {
	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QuerySessionByUserIDandDateID")
	// defer span.End()

	const q = `SELECT * from sessions WHERE user_id =$1 and date_id=$2`

	a.log.Printf("%s : %s : query : %s", traceID, "session.QuerySessionByUserIDandDateID",
		database.Log(q, userID, dateID),
	)

	sessioninfo := []SessionInfo{}
	if err := a.db.SelectContext(ctx, &sessioninfo, q, userID, dateID); err != nil {
		return nil, errors.Wrapf(err, "selecting sessionInfo")
	}

	return sessioninfo, nil
}

//DateIDGenerate generates dateid for every session,
//can be repeative for same day sessions
func (a Session) DateIDGenerate() (int, error) {
	timeNowStamp := time.Now()
	dateID, err := strconv.Atoi(timeNowStamp.Format("20060102"))
	return dateID, err
}

package articles

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/gosimple/slug"
	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/data/user"
	"github.com/jt6677/conduit-fullstack/foundation/database"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

var (
	// ErrNotFound is used when a specific User is requested but does not exist.
	ErrNotFound = errors.New("Not Article Found")
)

type Articles struct {
	log *log.Logger
	db  *sqlx.DB
}

func New(log *log.Logger, db *sqlx.DB) Articles {
	return Articles{
		log: log,
		db:  db,
	}
}

// InsertArticle insert a new article into DB
func (a Articles) InsertArticle(ctx context.Context, traceID string, article Article, userId int) (string, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.InsertArticle")
	defer span.End()
	article.Slug = slug.Make(article.Title)
	const q = `INSERT INTO articles
				(author_id, slug, title, description, body)
				VALUES ($1, $2, $3, $4, $5 )`

	a.log.Printf("%s : %s : query : %s", traceID, "user.InsertArticle",
		database.Log(q, userId, article.Slug, article.Title, article.Description, article.Body),
	)

	if _, err := a.db.ExecContext(ctx, q, userId, article.Slug, article.Title, article.Description, article.Body); err != nil {
		return "", errors.Wrapf(err, "inserting article Title=%v AuthorId=%v", article.Title, userId)
	}
	return article.Slug, nil

}

// QueryArticleBySlug query with slug like "ss-ss-ss"
func (a Articles) QueryArticleBySlug(ctx context.Context, traceID string, slug string) (TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticleBySlug")
	defer span.End()
	const q = `SELECT slug,title,description,body,created_at, updated_at,author_id FROM articles WHERE slug = $1`

	a.log.Printf("%s : %s : query : %s", traceID, "user.QueryArticleBySlug",
		database.Log(q, slug),
	)
	var article Article
	if err := a.db.GetContext(ctx, &article, q, slug); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "selecting articles%q", slug)
	}
	const t = `SELECT username, email, bio, image FROM users WHERE user_id = $1`

	a.log.Printf("%s : %s : query : %s", traceID, "user.QueryByUsername",
		database.Log(q, article.AuthorId),
	)
	var usr user.UserInfo
	if err := a.db.GetContext(ctx, &usr, t, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, errors.Wrapf(err, "No user found with given author_id %q", article.AuthorId)
		}
		return TrustedArticle{}, errors.Wrapf(err, "Selecting user with user_id %q", article.AuthorId)
	}
	trustedUserInfo := user.TrustedUserInfo{
		Username: usr.Username,
		Email:    usr.Email,
		Bio:      usr.Bio.String,
		Image:    usr.Image.String,
	}
	TrustedArticle := TrustedArticle{
		Slug:        article.Slug,
		Title:       article.Title,
		Description: article.Description,
		Body:        article.Body,
		CreatedAt:   article.CreatedAt.Time,
		UpdatedAt:   article.UpdatedAt.Time,
		Author:      trustedUserInfo,
	}

	return TrustedArticle, nil
}

// QueryArticles return all articles
func (a Articles) QueryArticles(ctx context.Context, traceID string) ([]TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()
	const q = `SELECT * FROM articles`

	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q),
	)
	var trustedArticles []TrustedArticle
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q); err != nil {
		fmt.Println(err)
		if err == sql.ErrNoRows {
			return []TrustedArticle{}, ErrNotFound
		}
		return []TrustedArticle{}, errors.Wrapf(err, "querying all articles%q")
	}
	// fmt.Println(articles)
	for _, v := range articles {
		ta := TrustedArticle{
			Slug:        v.Slug,
			Title:       v.Title,
			Description: v.Description,
			Body:        v.Body,
			CreatedAt:   v.CreatedAt.Time,
			UpdatedAt:   v.UpdatedAt.Time,
		}
		// fmt.Println("!!!!", v.AuthorId)
		const t = `SELECT username, email, bio, image FROM users WHERE user_id = $1`

		a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
			database.Log(t, v.AuthorId),
		)
		var usr user.UserInfo
		if err := a.db.GetContext(ctx, &usr, t, v.AuthorId); err != nil {
			if err == sql.ErrNoRows {
				return []TrustedArticle{}, ErrNotFound
			}
			return []TrustedArticle{}, errors.Wrapf(err, "selecting user %q", v.AuthorId)
		}
		ta.Author = user.TrustedUserInfo{
			Username: usr.Username,
			Email:    usr.Email,
			Bio:      usr.Bio.String,
			Image:    usr.Image.String,
		}
		trustedArticles = append(trustedArticles, ta)

	}
	return trustedArticles, nil
}

// QueryArticlesByUser return all articles posted by user
func (a Articles) QueryArticlesByUser(ctx context.Context, traceID string, authorId int) ([]TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()
	const q = `SELECT * FROM articles WHERE author_id =$1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q, authorId),
	)
	var trustedArticles []TrustedArticle
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q, authorId); err != nil {
		if err == sql.ErrNoRows {
			return []TrustedArticle{}, ErrNotFound
		}
		return []TrustedArticle{}, errors.Wrapf(err, "querying all articles%q")
	}
	// fmt.Println(articles)
	for _, v := range articles {
		ta := TrustedArticle{
			Slug:        v.Slug,
			Title:       v.Title,
			Description: v.Description,
			Body:        v.Body,
			CreatedAt:   v.CreatedAt.Time,
			UpdatedAt:   v.UpdatedAt.Time,
		}
		// fmt.Println("!!!!", v.AuthorId)
		const t = `SELECT username, email, bio, image FROM users WHERE user_id = $1`

		a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
			database.Log(t, v.AuthorId),
		)
		var usr user.UserInfo
		if err := a.db.GetContext(ctx, &usr, t, v.AuthorId); err != nil {
			if err == sql.ErrNoRows {
				return []TrustedArticle{}, ErrNotFound
			}
			return []TrustedArticle{}, errors.Wrapf(err, "selecting user %q", v.AuthorId)
		}
		ta.Author = user.TrustedUserInfo{
			Username: usr.Username,
			Email:    usr.Email,
			Bio:      usr.Bio.String,
			Image:    usr.Image.String,
		}
		trustedArticles = append(trustedArticles, ta)

	}
	return trustedArticles, nil
}

// QuerySessionByUserID gets all sessionInfo from one user with userID.
// func (a Articles) GetAllArticles(ctx context.Context, traceID string) ([]TrustedArticle, error) {
// 	// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QuerySessionByUserID")
// 	// defer span.End()

// 	const q = `SELECT * from sessions WHERE user_id =$1`

// 	a.log.Printf("%s : %s : query : %s", traceID, "session.QuerySessionByUserID",
// 		database.Log(q, userID),
// 	)

// 	sessioninfo := []SessionInfo{}
// 	if err := a.db.SelectContext(ctx, &sessioninfo, q, userID); err != nil {
// 		return nil, errors.Wrapf(err, "selecting sessionInfo")
// 	}

// 	return sessioninfo, nil
// }

// QuerySessionByUserIDandDateID gets all sessionInfo with UserID and DateID.
// func (a Articles) GetArticlsByUserName(ctx context.Context, traceID string, userID int, dateID int) ([]TrustedArticle, error) {
// ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QuerySessionByUserIDandDateID")
// defer span.End()

// const q = `SELECT * from sessions WHERE user_id =$1 and date_id=$2`

// a.log.Printf("%s : %s : query : %s", traceID, "session.QuerySessionByUserIDandDateID",
// 	database.Log(q, userID, dateID),
// )

// sessioninfo := []SessionInfo{}
// if err := a.db.SelectContext(ctx, &sessioninfo, q, userID, dateID); err != nil {
// 	return nil, errors.Wrapf(err, "selecting sessionInfo")
// }

// return sessioninfo, nil
// }

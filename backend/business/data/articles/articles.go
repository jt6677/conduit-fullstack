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
	"github.com/lib/pq"
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
func (a Articles) QueryArticleBySlug(ctx context.Context, traceID string, slug string, userId int) (TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticleBySlug")
	defer span.End()
	const q = `SELECT * FROM articles WHERE slug = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticleBySlug",
		database.Log(q, slug),
	)
	var article Article
	if err := a.db.GetContext(ctx, &article, q, slug); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "selecting articles by slug %q", slug)
	}
	fmt.Println("!!!", article)

	const t = `SELECT username, email, bio, image FROM users WHERE user_id = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryUserInfoByAuthorId",
		database.Log(q, article.AuthorId),
	)
	var authorInfo user.UserInfo
	if err := a.db.GetContext(ctx, &authorInfo, t, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "Selecting user with author_id %q", article.AuthorId)
	}
	// fmt.Println("!!!!!!!!!!", article.Id)
	return a.composeTrustedArticle(ctx, traceID, article, authorInfo, userId), nil
}

// QueryArticles return all articles
func (a Articles) QueryArticles(ctx context.Context, traceID string, userId int) ([]TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()

	const q = `SELECT * FROM articles`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q),
	)
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q); err != nil {
		if err == sql.ErrNoRows {
			return []TrustedArticle{}, ErrNotFound
		}
		return []TrustedArticle{}, errors.Wrapf(err, "querying all articles%q")
	}

	var trustedArticles []TrustedArticle
	for _, v := range articles {
		const t = `SELECT username, email, bio, image FROM users WHERE user_id = $1`
		a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
			database.Log(t, v.AuthorId),
		)
		var authorInfo user.UserInfo
		if err := a.db.GetContext(ctx, &authorInfo, t, v.AuthorId); err != nil {
			if err == sql.ErrNoRows {
				return []TrustedArticle{}, ErrNotFound
			}
			return []TrustedArticle{}, errors.Wrapf(err, "selecting user %q", v.AuthorId)
		}

		trustedArticles = append(trustedArticles, a.composeTrustedArticle(ctx, traceID, v, authorInfo, userId))

	}
	return trustedArticles, nil
}

// QueryArticlesByUser return all articles posted by user
func (a Articles) QueryArticlesByUser(ctx context.Context, traceID string, authorId int, userId int) ([]TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()

	var trustedArticles []TrustedArticle

	const q = `SELECT * FROM articles WHERE author_id =$1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q, authorId),
	)
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q, authorId); err != nil {
		if err == sql.ErrNoRows {
			return []TrustedArticle{}, ErrNotFound
		}
		return []TrustedArticle{}, errors.Wrapf(err, "querying all articles%q")
	}
	for _, v := range articles {

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

		trustedArticles = append(trustedArticles, a.composeTrustedArticle(ctx, traceID, v, usr, userId))

	}
	return trustedArticles, nil
}

// AddFavorite return all articles posted by user
func (a Articles) AddFavorite(ctx context.Context, traceID string, userId int, slug string) (TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.AddFavorite")
	defer span.End()

	//query article by slug
	const t = `SELECT * FROM articles WHERE slug = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "user.QueryArticleBySlug",
		database.Log(t, slug),
	)
	var article Article
	if err := a.db.GetContext(ctx, &article, t, slug); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "querying article %q", slug)
	}

	//query authorInfo by authorId
	const s = `SELECT username, email, bio, image FROM users WHERE user_id = $1`

	a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
		database.Log(s, article.AuthorId),
	)
	var authorInfo user.UserInfo
	if err := a.db.GetContext(ctx, &authorInfo, s, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "selecting user %q", article.AuthorId)
	}

	//insert into favorites, ignore duplicate error 23505
	const q = `INSERT INTO favorites (user_id, article_id) VALUES ($1, $2)`

	a.log.Printf("%s : %s : query : %s", traceID, "articles.AddFavorite",
		database.Log(q, userId, article.Id),
	)

	if _, err := a.db.ExecContext(ctx, q, userId, article.Id); err != nil {
		pqErr := err.(*pq.Error)
		//if err other than already exists
		if pqErr.Code != "23505" {
			return TrustedArticle{}, errors.Wrapf(err, "inserting favorites user_id=%v article_id=%v", userId, article.Id)
		}
	}
	trustedArticle := a.composeTrustedArticle(ctx, traceID, article, authorInfo, userId)
	return trustedArticle, nil
}

// DeleteFavorite return all articles posted by user
func (a Articles) DeleteFavorite(ctx context.Context, traceID string, userId int, slug string) (TrustedArticle, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.AddFavorite")
	defer span.End()

	//query article by slug
	const t = `SELECT * FROM articles WHERE slug = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "user.QueryArticleBySlug",
		database.Log(t, slug),
	)
	var article Article
	if err := a.db.GetContext(ctx, &article, t, slug); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "querying article %q", slug)
	}

	//query authorInfo by authorId
	const s = `SELECT username, email, bio, image FROM users WHERE user_id = $1`

	a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
		database.Log(s, article.AuthorId),
	)
	var authorInfo user.UserInfo
	if err := a.db.GetContext(ctx, &authorInfo, s, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return TrustedArticle{}, ErrNotFound
		}
		return TrustedArticle{}, errors.Wrapf(err, "selecting user %q", article.AuthorId)
	}

	const q = `DELETE FROM favorites WHERE user_id=$1 AND article_id=$2`

	a.log.Printf("%s : %s : query : %s", traceID, "articles.DeleteFavorite",
		database.Log(q, userId, article.Id),
	)

	if _, err := a.db.ExecContext(ctx, q, userId, article.Id); err != nil {
		return TrustedArticle{}, errors.Wrapf(err, "Deleting favorites user_id=%v article_id=%v", userId, article.Id)
	}

	trustedArticle := a.composeTrustedArticle(ctx, traceID, article, authorInfo, userId)
	return trustedArticle, nil
}

func (a Articles) composeTrustedArticle(ctx context.Context, traceID string, unsafeArticle Article, unsafeAuthorInfo user.UserInfo, userId int) TrustedArticle {

	trustedArticle := TrustedArticle{
		Slug:        unsafeArticle.Slug,
		Title:       unsafeArticle.Title,
		Description: unsafeArticle.Description,
		Body:        unsafeArticle.Body,
		CreatedAt:   unsafeArticle.CreatedAt.Time,
		UpdatedAt:   unsafeArticle.UpdatedAt.Time,
		Author: user.TrustedUserInfo{
			Username: unsafeAuthorInfo.Username,
			Email:    unsafeAuthorInfo.Email,
			Bio:      unsafeAuthorInfo.Bio.String,
			Image:    unsafeAuthorInfo.Image.String,
		},
		Favorited: false,
	}

	//check if user has favorited this article
	//ignore checking if userId = -1
	//error is ignored
	if userId != -1 {
		const q = `SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND article_id = $2`
		a.log.Printf("%s : %s : query : %s", traceID, "articles.composeTrustedArticle",
			database.Log(q, userId, unsafeArticle.Id),
		)
		var count int
		if err := a.db.GetContext(ctx, &count, q, userId, unsafeArticle.Id); err != nil {
			return trustedArticle
		}
		if count == 1 {
			trustedArticle.Favorited = true
		}
	}

	return trustedArticle
}

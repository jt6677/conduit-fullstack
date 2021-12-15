package articles

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/google/uuid"
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
	ErrNotFound     = errors.New("No Article Found")
	ErrNotPermitted = errors.New("Not Permitted")
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
func (a Articles) InsertArticle(ctx context.Context, traceID string, article Article, userId string) (string, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.InsertArticle")
	defer span.End()
	article.Id = uuid.New().String()
	article.Slug = slug.Make(article.Title)

	const q = `
		INSERT INTO 
		articles	(article_id, author_id, slug, title, description, body)
		VALUES	($1,		 $2,		$3,	$4,	 $5,		  $6 )
				`

	a.log.Printf("%s : %s : query : %s", traceID, "user.InsertArticle",
		database.Log(q, article.Id, userId, article.Slug, article.Title, article.Description, article.Body),
	)

	if _, err := a.db.ExecContext(ctx, q, article.Id, userId, article.Slug, article.Title, article.Description, article.Body); err != nil {
		return "", errors.Wrapf(err, "inserting article Title=%v AuthorId=%v", article.Title, userId)
	}
	return article.Slug, nil

}

// UpdateArticle updates article by slug with userId==authorId
func (a Articles) UpdateArticle(ctx context.Context, traceID string, prevArticleSlug string, article Article, userId string) (string, error) {

	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.UpdateArticle")
	defer span.End()

	article.Slug = slug.Make(article.Title)

	const q = `UPDATE articles SET
		"slug"		= $3,
		"title"		= $4,
		"description"	= $5,
		"body" 		= $6,
		"updated_at"	= $7
		WHERE slug = $1 AND author_id =$2 `

	a.log.Printf("%s : %s : query : %s", traceID, "articles.Update",
		database.Log(q, prevArticleSlug, userId, article.Slug, article.Title, article.Description, article.Body, time.Now()),
	)

	if _, err := a.db.ExecContext(ctx, q, prevArticleSlug, userId, article.Slug, article.Title, article.Description, article.Body, time.Now()); err != nil {
		return "", errors.Wrap(err, "updating article")
	}

	return article.Slug, nil

}

// DeleteArticle delete article by slug with userId==authorId
func (a Articles) DeleteArticle(ctx context.Context, traceID string, slug string, userId string) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticleBySlug")
	defer span.End()

	const d = `DELETE FROM articles WHERE slug = $1 and author_id = $2`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.DeleteArticle",
		database.Log(d, slug, userId),
	)
	if _, err := a.db.ExecContext(ctx, d, slug, userId); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return errors.Wrapf(err, "deleting articles by slug %q", slug)
	}
	return nil
}

// QueryArticleBySlug query with slug like "ss-ss-ss"
func (a Articles) QueryArticleBySlug(ctx context.Context, traceID string, slug string, userId string) (Article, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticleBySlug")
	defer span.End()
	const q = `SELECT * FROM articles WHERE slug = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticleBySlug",
		database.Log(q, slug),
	)
	var article Article
	if err := a.db.GetContext(ctx, &article, q, slug); err != nil {
		if err == sql.ErrNoRows {
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "articles.QueryArticleBySlug.Selecting articles by slug %q", slug)
	}

	const t = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticleBySlug Getting Author with AuthorId",
		database.Log(q, article.AuthorId),
	)
	if err := a.db.GetContext(ctx, &article.Author, t, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "articles.QueryArticleBySlug Getting Author with AuthorId %q", article.AuthorId)
	}
	// a.composeArticleWithFavoritedInfo(ctx, traceID, article, article.Author, userId)
	return a.composeArticleWithFavoritedInfo(ctx, traceID, article, article.Author, userId), nil
}

// QueryArticles return all articles
func (a Articles) QueryArticles(ctx context.Context, traceID string, userId string) ([]Article, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()

	const q = `SELECT * FROM articles`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q),
	)
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q); err != nil {
		if err == sql.ErrNoRows {
			return []Article{}, ErrNotFound
		}
		return []Article{}, errors.Wrapf(err, "querying all articles%q")
	}

	var composedArticles []Article
	for _, v := range articles {
		const t = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`
		a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
			database.Log(t, v.AuthorId),
		)
		var authorInfo user.UserInfo
		if err := a.db.GetContext(ctx, &authorInfo, t, v.AuthorId); err != nil {
			if err == sql.ErrNoRows {
				return []Article{}, ErrNotFound
			}
			return []Article{}, errors.Wrapf(err, "selecting user %q", v.AuthorId)
		}

		composedArticles = append(composedArticles, a.composeArticleWithFavoritedInfo(ctx, traceID, v, authorInfo, userId))

	}
	return composedArticles, nil
}

// QueryArticlesByUser return all articles posted by user
func (a Articles) QueryArticlesByUser(ctx context.Context, traceID string, authorId string, userId string) ([]Article, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.article.QueryArticles")
	defer span.End()

	const q = `SELECT * FROM articles WHERE author_id =$1`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.QueryArticles",
		database.Log(q, authorId),
	)
	var articles []Article
	if err := a.db.SelectContext(ctx, &articles, q, authorId); err != nil {
		if err == sql.ErrNoRows {
			return []Article{}, ErrNotFound
		}
		return []Article{}, errors.Wrapf(err, "querying all articles%q")
	}
	var composedArticles []Article
	for _, v := range articles {

		const t = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`
		a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
			database.Log(t, v.AuthorId),
		)
		var usr user.UserInfo
		if err := a.db.GetContext(ctx, &usr, t, v.AuthorId); err != nil {
			if err == sql.ErrNoRows {
				return []Article{}, ErrNotFound
			}
			return []Article{}, errors.Wrapf(err, "selecting user %q", v.AuthorId)
		}

		composedArticles = append(composedArticles, a.composeArticleWithFavoritedInfo(ctx, traceID, v, usr, userId))

	}
	return composedArticles, nil
}

// AddFavorite return all articles posted by user
func (a Articles) AddFavorite(ctx context.Context, traceID string, userId string, slug string) (Article, error) {
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
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "querying article %q", slug)
	}

	//query authorInfo by authorId
	const s = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`
	a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
		database.Log(s, article.AuthorId),
	)
	var authorInfo user.UserInfo
	if err := a.db.GetContext(ctx, &authorInfo, s, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "selecting user %q", article.AuthorId)
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
			return Article{}, errors.Wrapf(err, "inserting favorites user_id=%v article_id=%v", userId, article.Id)
		}
	}
	article = a.composeArticleWithFavoritedInfo(ctx, traceID, article, authorInfo, userId)
	return article, nil
}

// DeleteFavorite return all articles posted by user
func (a Articles) DeleteFavorite(ctx context.Context, traceID string, userId string, slug string) (Article, error) {
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
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "querying article %q", slug)
	}

	//query authorInfo by authorId
	const s = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`

	a.log.Printf("%s : %s : query : %s", traceID, "article.QueryById",
		database.Log(s, article.AuthorId),
	)
	var authorInfo user.UserInfo
	if err := a.db.GetContext(ctx, &authorInfo, s, article.AuthorId); err != nil {
		if err == sql.ErrNoRows {
			return Article{}, ErrNotFound
		}
		return Article{}, errors.Wrapf(err, "selecting user %q", article.AuthorId)
	}

	const q = `DELETE FROM favorites WHERE user_id=$1 AND article_id=$2`
	a.log.Printf("%s : %s : query : %s", traceID, "articles.DeleteFavorite",
		database.Log(q, userId, article.Id),
	)

	if _, err := a.db.ExecContext(ctx, q, userId, article.Id); err != nil {
		return Article{}, errors.Wrapf(err, "Deleting favorites user_id=%v article_id=%v", userId, article.Id)
	}

	article = a.composeArticleWithFavoritedInfo(ctx, traceID, article, authorInfo, userId)
	return article, nil
}

func (a Articles) composeArticleWithFavoritedInfo(ctx context.Context, traceID string, article Article, unsafeAuthorInfo user.UserInfo, userId string) Article {

	article.Favorited = false
	article.FavoritesCount = 0
	//check if user has favorited this article
	//ignore checking if userId = -1
	//error is ignored
	if userId != "not-signed-in" {
		const q = `SELECT COUNT(*) FROM favorites WHERE user_id = $1 AND article_id = $2`
		a.log.Printf("%s : %s : query : %s", traceID, "articles.composeArticleWithFavoritedInfo",
			database.Log(q, userId, article.Id),
		)
		var count int
		if err := a.db.GetContext(ctx, &count, q, userId, article.Id); err != nil {
			return article
		}
		if count == 1 {
			article.Favorited = true
		}
	}

	return article
}

// Package user contains user related CRUD functionality.
package comments

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/jt6677/conduit-fullstack/business/data/articles"
	"github.com/jt6677/conduit-fullstack/business/data/schema"
	"github.com/jt6677/conduit-fullstack/business/data/user"
	"github.com/jt6677/conduit-fullstack/foundation/database"
	"github.com/pkg/errors"
	"go.opentelemetry.io/otel/api/trace"
)

//Add a pepper to hash generation
var (
	// ErrNotFound is used when a specific User is requested but does not exist.
	ErrNotFound = errors.New("not found")

	// ErrAlreadyExists is used when username or email already existed.
	ErrAlreadyExists = errors.New("username or email is not avaliable")

	// ErrInvalidID occurs when an ID is not in a valid form.
	ErrInvalidId = errors.New("Id is not in its proper form")

	// ErrAuthenticationFailure occurs when a user attempts to authenticate but
	// anything goes wrong.
	ErrAuthenticationFailure = errors.New("authentication failed")

	// ErrForbidden occurs when a user tries to do something that is forbidden to them according to our access control policies.
	ErrForbidden = errors.New("attempted action is not allowed")
)

// User manages the set of API's for user access.
type Comments struct {
	log *log.Logger
	db  *sqlx.DB
}

// New constructs a User for api access.
func New(log *log.Logger, db *sqlx.DB) Comments {
	return Comments{
		log: log,
		db:  db,
	}
}

// InsertComment insert a new comment into DB
func (c Comments) InsertComment(ctx context.Context, traceID string, now time.Time, comment Comment) (Comment, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.comment.InsertArticle")
	defer span.End()
	comment.Id = uuid.New().String()
	comment.CreatedAt = schema.CreateNullTime(now.UTC())
	comment.UpdatedAt = schema.CreateNullTime(now.UTC())
	const q = `
		INSERT INTO 
		comments	(comment_id, commenter_id, article_id, parent_id, body, created_at, updated_at)
		VALUES	($1,		 $2,		   $3,	   $4,	  $5,   $6,		  $7 )
				`

	c.log.Printf("%s : %s : query : %s", traceID, "user.InsertArticle",
		database.Log(q, comment.Id, comment.CommenterId, comment.ArticleId, comment.ParentId, comment.Body, comment.CreatedAt, comment.UpdatedAt))

	// var insertedComment Comment
	if _, err := c.db.ExecContext(ctx, q, comment.Id, comment.CommenterId, comment.ArticleId, comment.ParentId, comment.Body, comment.CreatedAt, comment.UpdatedAt); err != nil {
		return Comment{}, errors.Wrapf(err, "inserting comment Id=%v AuthorId=%v", comment.Id, comment.CommenterId)
	}
	comment, err := c.findCommenter(ctx, traceID, comment)
	if err != nil {
		return Comment{}, errors.Wrapf(err, "finding commenterInfo UserId=%v ", comment.CommenterId)
	}
	return comment, nil

}

func (c Comments) GetComments(ctx context.Context, traceID string, articleId string) ([]Comment, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.comments.GetComment")
	defer span.End()
	const q = `SELECT comment_id, commenter_id, article_id, parent_id, body, created_at FROM comments WHERE article_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.GetComments",
		database.Log(q, articleId),
	)
	var comments []Comment
	if err := c.db.SelectContext(ctx, &comments, q, articleId); err != nil {
		if err == sql.ErrNoRows {
			return []Comment{}, ErrNotFound
		}
		return []Comment{}, errors.Wrapf(err, "comments.GetComments selecting comments=%q", articleId)
	}
	var commentsWithCommenterInfo []Comment
	for _, comment := range comments {
		comment, err := c.findCommenter(ctx, traceID, comment)
		if err != nil {
			return []Comment{}, errors.Wrapf(err, "finding commenterInfo CommenterId=%v ", comment.CommenterId)
		}
		commentsWithCommenterInfo = append(commentsWithCommenterInfo, comment)
	}
	return commentsWithCommenterInfo, nil
}
func (c Comments) DeleteComment(ctx context.Context, traceID string, articleId string, commentId string, userId string) error {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.comments.DeleteComment")
	defer span.End()
	//get authorId
	const t = `SELECT author_id FROM articles WHERE article_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.DeleteComment.isArticleAuthor",
		database.Log(t, articleId),
	)
	var article articles.Article
	if err := c.db.GetContext(ctx, &article, t, articleId); err != nil {
		return errors.Wrapf(err, "comments.GetComments selecting comments=%q", articleId)
	}
	//get commenter_id
	const q = `SELECT commenter_id FROM comments WHERE comment_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.DeleteComment.isCommentOwner",
		database.Log(q, commentId),
	)

	var comment Comment
	if err := c.db.GetContext(ctx, &comment, q, commentId); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return errors.Wrapf(err, "comments.DeleteComment.isCommentOwner comment_id=%q", commentId)
	}
	//userId must be authorId or comment.CommenterId to perform delete
	if comment.CommenterId != userId && article.AuthorId != userId {
		fmt.Println("a ...interface{}", userId)
		fmt.Println("a ...interface{}", comment.CommenterId)
		fmt.Println("a ...interface{}", article.AuthorId)
		return ErrForbidden
	}

	//delete comment itself
	const d = `DELETE FROM comments WHERE comment_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.DeleteComment.deleteComment",
		database.Log(q, commentId),
	)
	if _, err := c.db.ExecContext(ctx, d, commentId); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return errors.Wrapf(err, "comments.DeleteComment.deleteComment %q", commentId)
	}
	//delete all children comments
	const d2 = `DELETE FROM comments WHERE parent_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.DeleteComment.deleteChildren",
		database.Log(q, commentId),
	)
	if _, err := c.db.ExecContext(ctx, d2, commentId); err != nil {
		if err == sql.ErrNoRows {
			return ErrNotFound
		}
		return errors.Wrapf(err, "comments.DeleteComment.deleteChildren %q", commentId)
	}
	return nil
}

func (c Comments) findCommenter(ctx context.Context, traceID string, comment Comment) (Comment, error) {
	ctx, span := trace.SpanFromContext(ctx).Tracer().Start(ctx, "business.data.comments.findCommenter")
	defer span.End()
	const q = `SELECT user_id, username, email, bio, image FROM users WHERE user_id = $1`
	c.log.Printf("%s : %s : query : %s", traceID, "comments.findCommenter",
		database.Log(q, comment.CommenterId),
	)
	var commenterInfo user.UserInfo
	if err := c.db.GetContext(ctx, &commenterInfo, q, comment.CommenterId); err != nil {
		if err == sql.ErrNoRows {
			return Comment{}, ErrNotFound
		}
		return Comment{}, errors.Wrapf(err, "comments.findCommenter selecting user=%q", comment.CommenterId)
	}
	comment.CommenterInfo = commenterInfo
	return comment, nil
}

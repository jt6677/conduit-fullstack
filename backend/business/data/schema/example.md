type Article struct {
gorm.Model
Slug string `gorm:"unique_index;not null"`
Title string `gorm:"not null"`
Description string
Body string
Author User
AuthorID uint
Comments []Comment
Favorites []User `gorm:"many2many:favorites;"`
Tags []Tag `gorm:"many2many:article_tags; association_autocreate:false"`
}

type Comment struct {
gorm.Model
Article Article
ArticleID uint
User User
UserID uint
Body string
}

type Tag struct {
gorm.Model
Tag string `gorm: "unique_index"`

user

type User struct {
gorm.Model
Username string `gorm:"unique_index;not nul"`
Email string `gorm:"unique_index;not null"`
Password string `gorm:"not null"`
Bio *string
Image *string
Followers []Follow `gorm:"foreignkey:FollowingID"`
Followings []Follow `gorm:"foreignkey:FollowerID"`
Favorites []Article `gorm:"many2many:favorites;"`
}

type Follow struct {
Follower User
FollowerID uint `gorm:"primary_key" sql:"type:int not null"`
Following User
FollowingID uint `gorm:"primary_key" sql:"type:int not null"`
}
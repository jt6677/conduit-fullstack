const jsonServer = require('json-server')
const db = require('./db.json')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const slugify = (text) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
server.use(middlewares)
server.use(jsonServer.bodyParser)
const userProfiles = [
  {
    username: 'jake',
    bio: 'I heart coding',
    image: 'https://i.ibb.co/JvGgxrG/logo.jpg',
    following: false,
  },
  {
    username: 'tom321',
    bio: 'I work at statefarm',
    image: 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: false,
  },
]
let articlesList = db.articles.articles
let articlesListCount = db.articles.articlesCount

server.post('/users/login', (req, res) => {
  const user = {
    user: {
      email: req.body.user.email,
      token: 'jwt.token.here',
      username: req.body.user.email.split('@')[0],
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
    },
  }
  res.json(user)
  //   res.sendStatus(200)
})

// /articles/how-to-train-your-dragon
server.get('/article/:articleSlug', (req, res) => {
  const article = articlesList.filter(
    (article) => article.slug === req.params.articleSlug
  )
  article.createdAt = new Date(article.createdAt)
  article.updateAt = new Date(article.updateAt)
  res.json(article[0])
})
// /profile/tom321
server.get('/profiles/:username', (req, res) => {
  const user = userProfiles.filter(
    (profile) => profile.username === req.params.username
  )
  res.json({ profile: user[0] })
})
//get localhost:4000/articles
server.get('/articles', (req, res) => {
  res.json({
    articles: articlesList,
    articlesCount: articlesListCount,
  })
})
server.post('/articles', (req, res) => {
  let article = req.body.article
  article = {
    ...article,
    slug: slugify(article.title),
    createdAt: `${Date.now()}`,
    updatedAt: `${Date.now()}`,
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: false,
    },
  }
  articlesList.push(article)
  articlesListCount++
  console.log(articlesList, articlesListCount)
  // const slug = slugify(article.title)
  // console.log(slug)
  //  body: { article: { title: '', description: '', body: '', tagList: [] } },
  res.sendStatus(200)
})

// Use default router
http: server.use(router)
server.listen(4000, () => {
  console.log('JSON Server is running')
})
// const jsonServer = require('json-server')
// const server = jsonServer.create()
// const _ = require('lodash')
// const router = jsonServer.router('./db.json')
// const middlewares = jsonServer.defaults()

// server.use(middlewares)
// server.use(jsonServer.bodyParser)

// server.post('/addtasks', (req, res) => {
//   const db = router.db // Assign the lowdb instance
//   if (Array.isArray(req.body)) {
//     req.body.forEach((element) => {
//       insert(db, 'tasks', element)
//     })
//   } else {
//     insert(db, 'tasks', req.body)
//   }
//   res.sendStatus(200)

//   function insert(db, collection, data) {
//     const table = db.get(collection)

//     // Create a new doc if this ID does not exist
//     if (_.isEmpty(table.find({ _id: data._id }).value())) {
//       table.push(data).write()
//     } else {
//       // Update the existing data
//       table
//         .find({ _id: data._id })
//         .assign(_.omit(data, ['_id']))
//         .write()
//     }
//   }
// })

// server.use(router)
// server.listen(3100, () => {
//   console.log('JSON Server is running')
// })

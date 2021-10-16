const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)
const articlesList = [
  {
    slug: 'how-to-train-your-dragon',
    title: 'How to train your dragon',
    description: 'Ever wonder how?',
    body: 'It takes a Jacobian',
    tagList: ['dragons', 'training'],
    createdAt: '2016-02-18T03:22:56.637Z',
    updatedAt: '2016-02-18T03:48:35.824Z',
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: false,
    },
  },
  {
    slug: 'how-to-train-your',
    title: 'How to train your ',
    description: 'So toothless',
    body: 'It a dragon',
    tagList: ['dragons', 'training'],
    createdAt: '2016-02-18T03:22:56.637Z',
    updatedAt: '2016-02-18T03:48:35.824Z',
    favorited: true,
    favoritesCount: 2,
    author: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: true,
    },
  },
  {
    slug: 'how-to-train-your-dragon-2',
    title: 'How to train your dragon 2',
    description: 'So toothless',
    body: 'It a dragon',
    tagList: ['dragons', 'training'],
    createdAt: '2016-02-18T03:22:56.637Z',
    updatedAt: '2016-02-18T03:48:35.824Z',
    favorited: true,
    favoritesCount: 2,
    author: {
      username: 'jake',
      bio: 'I work at statefarm',
      image: 'https://i.stack.imgur.com/xHWG8.jpg',
      following: true,
    },
  },
]

server.post('/users/login', (req, res) => {
  console.log(req.body.user.email.split('@')[0])
  //   console.log(req.body.email.split('@')[0])
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
server.get('/articles/:articleSlug', (req, res) => {
  console.log(req.params)
  const article = articlesList.filter(
    (article) => article.slug === req.params.articleSlug
  )
  article.createdAt = new Date(article.createdAt)
  article.updateAt = new Date(article.updateAt)
  // console.log(article)
  res.json(article[0])
})

// Use default router
server.use(router)
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

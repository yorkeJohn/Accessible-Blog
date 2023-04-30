/**
* server.js
* CSCI 2356 Project Group 1
* @author John Yorke
*/

require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const { join } = require('path')

const app = express()

app.use(express.static(join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

/* mysql */
const mysql = require("mysql2/promise")
/* database connection */
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DB
})

/* SQL query function */
const query = async (sql, args) => {
  try {
    const [results] = await pool.query(sql, args)
    return results
  } catch (error) {
    console.log(`MySQL Error: ${error}`)
  }
}

const isValid = param => typeof param === 'string'
const allValid = params => params.every(isValid)

const rejectInvalidReq = (res) => {
  const err = { statusCode: 400, message: 'Invalid request' }
  renderErr(res, err)
}

const renderErr = (res, err) => {
  const body = { statusCode: err.statusCode, message: err.message }
  res.status(err.statusCode).render(join(__dirname, 'views/error'), body)
}

/* start app */
const port = process.env.NODE_PORT || 3000
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

/* Main page */
app.get('/', async function (req, res) {
  const homeQuery = `SELECT BlogID, BlogTitle, Published FROM blogs`
  const home = await query(homeQuery)
  const body = { blogs: home }
  res.render(join(__dirname, 'views/home'), body)
})

app.get('/editor/:id', async function (req, res) {
  const id = req.params.id
  if(isValid(id)) {
    const blogQuery = `SELECT BlogTitle, BlogText FROM blogs WHERE BlogID = ?`
    const blog = await query(blogQuery, id)
    if(blog.length === 0) {
      rejectInvalidReq(res)
    } else {
      const body = { blog: blog[0] }
      res.render(join(__dirname, 'views/editor'), body)
    }
  } else {
    rejectInvalidReq(res)
  }
})

app.post('/editor/:id', async function (req, res) {
  const id = req.params.id
  const { title, text } = req.body
  if(allValid([id, title, text])) {
    const saveQuery = `
      INSERT INTO blogs (BlogID, BlogTitle, BlogText) VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE BlogTitle = ?, BlogText = ?
    `
    await query(saveQuery, [id, title, text, title, text])
  } else {
    rejectInvalidReq(res)
  }
})

app.delete('/editor/:id', async function (req, res) {
  const id = req.params.id
  if(isValid(id)) {
    const deleteQuery = `DELETE FROM blogs WHERE BlogID = ?`
    await query(deleteQuery, id)
    return res.end()
  } else {
    rejectInvalidReq(res)
  }
})

/* Endpoint to save publish status to the server */
app.post('/publish', async function (req, res) {
  const { id, published } = req.body
    if(allValid([id, published])) {
    const publishQuery = `
      INSERT INTO blogs (BlogID, Published) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE Published = ?
    `
    await query(publishQuery, [id, published, published])
  } else {
    rejectInvalidReq(res)
  }
})

/* Published blog page */
app.get('/public/:id', async function (req, res) {
  const id = req.params.id
  if(isValid(id)) {
    const blogQuery = `SELECT BlogTitle, BlogText, Published FROM blogs WHERE BlogID = ?`
    const blog = await query(blogQuery, id)
    if(blog.length === 0 || !blog[0].Published) {
      rejectInvalidReq(res)
    } else {
      const body = { blog: blog[0] }
      res.render(join(__dirname, 'views/public'), body)
    }
  } else {
    rejectInvalidReq(res)
  }
})

app.post('/new', async function (req, res) {
  const newBlogQuery = `
    INSERT INTO blogs (BlogTitle) VALUES (?)
  `
  await query(newBlogQuery, 'My Blog')
  return res.end()
})



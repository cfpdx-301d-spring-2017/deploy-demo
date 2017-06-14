'use strict';

// Add environment variables so we can still run our app locally
// - Create a .env file to hold the variables
// - Use the npm package: dotenv to access process.env 
require('dotenv').config();

const pg = require('pg');
const fs = require('fs');
const express = require('express');
const requestProxy = require('express-request-proxy'); 
const PORT = process.env.PORT || 3000;
const app = express();

const conString = 'postgres://postgres:1234@localhost:5432/demoblog'; 
const client = new pg.Client(conString);
client.connect();
client.on('error', err => console.error(err));

app.use(express.static('./public'));





app.get('/', (request, response) => {
  response.sendFile('index.html', { root: './public' });
});

// Use a proxy request to obscure our information even more
// - From the client, query our /github/ route
// - User the npm package: express-request-proxy to make call github's servers
app.get('/github/*', function ( request, response ) {
  ( requestProxy({
    url: `https://api.github.com/${request.params[0]}`,
    headers: {Authorization: `token ${process.env.GITHUB_TOKEN}`}
  }))(request, response);
});

app.get('/articles', (request, response) => {
  client.query(`
    SELECT * FROM articles
    INNER JOIN authors
      ON articles.author_id=authors.author_id;`
  )
  .then(result => response.send(result.rows))
  .catch(console.error);
});

app.get('*', (request, response) => {
  console.log('The server is handling a request');
  response.sendFile('index.html', { root: './public' });
});






// Database loaders

function loadAuthors() {
  fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
    JSON.parse(fd.toString()).forEach(ele => {
      client.query(
        'INSERT INTO authors(author, "authorUrl") VALUES($1, $2) ON CONFLICT DO NOTHING',
        [ele.author, ele.authorUrl]
      )
      .catch(console.error);
    })
  })
}

function loadArticles() {
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(author_id, title, category, "publishedOn", body)
            SELECT author_id, $1, $2, $3, $4
            FROM authors
            WHERE author=$5;
          `,
            [ele.title, ele.category, ele.publishedOn, ele.body, ele.author]
          )
          .catch(console.error);
        })
      })
    }
  })
}

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR (255)
    );`
  )
  .then(loadAuthors)
  .catch(console.error);

  client.query(`
    CREATE TABLE IF NOT EXISTS
    articles (
      article_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`
  )
  .then(loadArticles)
  .catch(console.error);
}






// Start it up!
loadDB();
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
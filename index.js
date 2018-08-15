const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const query = require('./query');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  );

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', './template')
app.set('view engine', 'pug');
app.get('/', (req, res) => {
  res.render('index');
});
app.post('/api/queryTrains', async (req, res) => {
  const { Signature: sig } = await query.login();
  const json = await query.getAvailableTrain({ sig, ...req.body });
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(json));
});

http.listen(port, function() {
  console.log("Listening http://localhost:" + port);
});

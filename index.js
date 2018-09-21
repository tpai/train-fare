const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const query = require('./query');

// parse json
app.use(bodyParser.json());

// set headers
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

app.set('views', './template')
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  const {
    username,
    password,
    depart,
    arrival,
    is_round,
    interval_start,
    round_start,
    adult,
    child,
    class_lv,
    service,
    promo_code,
    pax_price,
  } = req.query;
  res.render('index', {
    username,
    password,
    depart,
    arrival,
    is_round,
    interval_start,
    round_start,
    adult,
    child,
    class_lv,
    service,
    promo_code,
    pax_price,
  });
});

app.get('/apidoc', (req, res) => {
  res.render('apidoc');
});

app.post('/api/login', async (req, res) => {
  const json = await query.login(req.body);
  res.send(JSON.stringify(json));
});

app.post('/api/getAvailableTrains', async (req, res) => {
  const json = await query.getAvailableTrains(req.body);
  res.send(JSON.stringify(json));
});

http.listen(port, function() {
  console.log("Listening http://localhost:" + port);
});

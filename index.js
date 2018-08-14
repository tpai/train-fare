const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 8000;

app.set('views', './template')
app.set('view engine', 'pug');
app.use('/', (req, res) => {
  res.render('index');
});

http.listen(port, function() {
  console.log("Listening http://localhost:" + port);
});

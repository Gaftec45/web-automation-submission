// app.js
const express = require('express');
const path = require('path');
const medium = require('./bots/mediumBot');
const { getBusinessList } = require('./utils/sheets');
const pinterestRouter = require('./routes/pinterest');
const linkedinRouter = require('./routes/linkedin');
const mediumRouter = require('./routes/medium');

const app = express();
const PORT = process.env.PORT || 3000;

// Use Express built-in body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});


app.use('/', mediumRouter)
app.use('/', pinterestRouter);
app.use('/', linkedinRouter);


app.listen(PORT, () => console.log(`🌐 Server running at http://localhost:${PORT}`));
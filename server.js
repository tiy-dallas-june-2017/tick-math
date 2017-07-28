const express = require('express');
const mustache = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
  secret: 'hagen',
  resave: false,
  saveUninitialized: true
}));

const theMustEngine = mustache();
theMustEngine.cache = null;
app.engine('mustache', theMustEngine);
app.set('view engine', 'mustache');

function generateAndRenderPage(req, res) {
  const num1 = Math.ceil(Math.random() * 10);
  const num2 = Math.ceil(Math.random() * 10);

  req.session.num1 = num1;
  req.session.num2 = num2;

  res.render('index', {
    num1: num1,
    num2: num2,
    correctCount: req.session.correctCount,
    incorrectCount: req.session.incorrectCount
  });
}

app.get('/', function(req, res) {
  generateAndRenderPage(req, res);
});

app.post('/', function(req, res) {

  //Calculating correctness
  if (Number(req.body.sum) === req.session.num1 + req.session.num2) {
    if (req.session.correctCount === undefined) {
      req.session.correctCount = 1;
    }
    else {
      req.session.correctCount += 1;
    }
  } else {
    if (req.session.incorrectCount === undefined) {
      req.session.incorrectCount = 1;
    }
    else {
      req.session.incorrectCount += 1;
    }
  }

  //Remembering the question
  let questions = req.session.questions || [];
  console.log('what is this?', questions);
  questions.push({
    num1: req.session.num1,
    num2: req.session.num2,
    sum: Number(req.body.sum)
  });
  req.session.questions = questions;

  console.log('posted data', req.body, req.session);

  //generating the page again for the next phase of the quiz
  generateAndRenderPage(req, res);
});

app.listen(5076, function() {
  console.log('Listening on 5076');
});

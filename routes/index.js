const express = require('express');
const router = express.Router();

const userModel = require('./users');
const postModel = require('./post');

const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', checkLoggedIn, function (req, res, next) {
  res.render('index',);
});

router.get('/timeline', function (req, res, next) {
  postModel.find()
    .populate('user')
    .then(function (allPosts) {
      res.render('timeline', { allPosts });
    });
});

router.post('/comment/:postId', function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (loginUser) {
      postModel.findOne({ _id: req.params.postId })
        .then(function (commentedPost) {
          var data = {
            comment: req.body.comment,
            userId: req.session.passport.user
          };
          commentedPost.comment.push(data);
          commentedPost.save()
            .then(function () {
              res.redirect('/timeline');
            });
        });
    });
});

router.get('/create', function (req, res, next) {
  res.render('create');
});

router.post('/upload', upload.single('image'), function (req, res, next) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (loginUser) {
      postModel.create({
        image: req.file.filename,
        text: req.body.text,
        user: loginUser._id
      })
        .then(function (createdPost) {
          loginUser.posts.push(createdPost);
          loginUser.save()
            .then(function () {
              res.redirect('/timeline');
            });
        });
    });
});

router.post('/register', function (req, res, next) {
  var newUser = new userModel({
    name: req.body.name,
    username: req.body.username
  });

  userModel.register(newUser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/timeline');
      });
    });

});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/timeline',
  failureRedirect: '/'
}), function (req, res, next) {
});


router.get('/logout', function (req, res, next) {
  req.logOut();
  res.redirect('/');
});

function checkLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/timeline');
  } else {
    return next();
  }
}
module.exports = router;

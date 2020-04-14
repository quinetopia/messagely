const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUser
  }                 = require("../middleware/auth");

const router = new express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", async function (req, res, next) {
  // Only allow access if logged in
  try {
    if (req.user){
      const users = await User.all();
      console.log(`\n\n\n in router.get : `, users)

      return res.json(users);
    }else{
      throw new ExpressError("Unauthorized. Please login.", 401)
    }
  }catch (err){
    return next(err)
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', async function(req, res, next){
  try{
    if (req.user){
      let username = req.params.username;
      let user = await User.get(username);

      return res.json(user)
  }else{
    throw new ExpressError("Unauthorized. Please login.", 401)
  }
}catch (err){
  return next(err)
}
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async function(req, res, next){
  try{
      ensureLoggedIn(req, res, next);
      ensureCorrectUser(req, res, next);
      let username = req.params.username;
      let messages = await User.messagesTo(username);

      return res.json(messages);

  }catch (err){
    return next(err)
  }
  });


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

 module.exports = router;
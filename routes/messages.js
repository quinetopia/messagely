const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
const {
        authenticateJWT,
        ensureLoggedIn,
        ensureCorrectUser
        }                 = require("../middleware/auth");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function(req, res, next){
  try {
    let currentUser = req.user.username;
    let msgId = req.params.id;
    let msg = await Message.get(msgId);
    if (currentUser != msg.from_user.username && 
        currentUser != msg.to_user.username){
          throw new ExpressError("Not authorized", 401)
        }
    return res.json(msg);
    }catch(err){
      return next(err);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async function(req, res, next){
  let sentMsg;
  try{
    let from_username = req.user.username;
    let { to_username, body } = req.body;
    sentMsg = await Message.create({from_username, to_username, body});
  }catch(err){  
    return next(err)}
  try {
    return res.json(sentMsg);
  }catch (err){
  return next(err)
}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req, res, next){
  try {
    let currentUser = req.user.username;
    let msgId = req.params.id;
    let msg = await Message.get(msgId);
    let msgRead;
    if (currentUser != msg.to_user.username){
          throw new ExpressError("Not authorized", 401)
    }else{
      msgRead = await Message.markRead(msgId);
    }
    return res.json(msgRead);
    }catch(err){
      return next(err);
    }
});

module.exports = router;
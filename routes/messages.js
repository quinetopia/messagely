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


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', async function(req, res, next){
  let sentMsg;
  try{
    ensureLoggedIn(req, res, next)
    let from_username = req.user.username;
    let { to_username, body } = req.body;
    sentMsg = await Message.create({from_username, to_username, body});
    console.log(`\n\n\n\n I got out of Message.create(). ${sentMsg.id}, ${sentMsg.from_username}, ${sentMsg.to_username}, ${sentMsg.body}, ${sentMsg.sent_at}\n\n\n\n`)
  }catch(err){  
    console.log(`\n\n In 1st Error catch. ${err}`)
    return next(err)}
  try {
    return res.json(sentMsg);
  }catch (err){
    console.log(`\n\n In 2nd Error catch. ${err}`)
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

module.exports = router;
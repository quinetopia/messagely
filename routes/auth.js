const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (User.authenticate(username, password)) {
      User.updateLoginTimestamp(username);

      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token });  
    } else {
      throw new ExpressError("Invalid user/password", 400);
    } 

  } catch(err) {
    return next(err);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
  console.log("\n\n Registration route", req.body, "\n\n")
  try {
    
    
    const newUser = { 
      username: req.body.username, 
      password: req.body.password, 
      first_name: req.body.first_name, 
      last_name: req.body.last_name, 
      phone: req.body.phone 
    }

    console.log("\n\n Recieved New User Information!", newUser, "\n\n")

    const username = newUser.username
    
    User.register(newUser);
    
    console.log("\n\n Registered new user!", "\n\n")
    
    let token = jwt.sign({ username }, SECRET_KEY);
  
    return res.json({ token });

  } catch(err) {
    return next(err);
  }
});

 module.exports = router;
const express = require("express");
const axios = require("axios");
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


router.get("/login", async function(req, res, next) {
  try {

    return res.render("login_form.html")
  } catch(err) {
    next(err);
  }
});


router.get("/messages/:id", async function(req, res, next) {
  try{
    const msgId = req.params.id;

    //const resp = await axios.get(`http://localhost:3000/messages/${msgId}`);
    let resp = await axios({
      method: 'get',
      url: `http://localhost:3000/messages/${msgId}`,
      data: {
        _token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkdyYWhhbTYiLCJpYXQiOjE1ODY4MTk2MTF9.ebMi-eH8fDT-z7ShRQw3U6f3QABkIf32Yl_cS4GU8EM",
      }
    });
    
    let message = resp.data;
    console.log(message);

    return res.render("message_detail.html", { message })

  } catch(err) {
    next(err);
  }
});

module.exports = router;
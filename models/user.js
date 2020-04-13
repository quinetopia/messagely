/** User class for message.ly */
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config")
const ExpressError = require("../expressError");
const db = require("../db");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashedPassword = await 
                            bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            phone,
            join_at,
            last_login_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
          RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);
    
  return result.rows[0];
  }



  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const response = await db.query(
      `SELECT username, password
      FROM users
      WHERE username = $1`, 
      [username])
    
      const user = response.rows[0]
      
      if (user){
        if (await bcrypt.compare(password, user.password) === true) {
          return true
        }
      }

      return false
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

  const results = await db.query(
    `UPDATE users
    SET last_login_at = current_timestamp
    WHERE username = $1
    RETURNING username`,
    [username]);
    
    if (results.rows.length === 0) {
      throw new ExpressError(`User not found: ${username}`, 404);
    }
  
  }
  
  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const allUsers = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users`
    );
  
    return allUsers.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `SELECT username, first_name, last_name,
        phone, join_at, last_login_at
      FROM users
      WHERE username = $1`, 
      [username]);
    
    if (result.rows.length === 0) {
      throw new expressError(`No such user: ${username}.`, 404); 
    } else {
      return result.rows[0];
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const messageResults = await db.query(`
      SELECT id, to_username, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`,
      [username]);
    
    let messages = messageResults.rows;

    // do in parallel? 
    // 2 loops: 1 to make the promises
    // second to add the data to messages
    for (let message of messages) {
      const userResults = await db.query(`
        SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1`, [message.to_username]);
      message.to_user = userResults.rows[0];
      delete message.to_username;
    }

    return messages;

}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const messageResults = await db.query(`
      SELECT id, from_username, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username]);
    
    let messages = messageResults.rows;

    // do in parallel? 
    // 2 loops: 1 to make the promises
    // second to add the data to messages
    for (let message of messages) {
      const userResults = await db.query(`
        SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1`, [message.from_username]);
      message.from_user = userResults.rows[0];
      delete message.from_username;
    }

    return messages;
  }
}


module.exports = User;
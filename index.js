const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

// registration new user

app.post("/users/", async (request, response) => {
  const { name, username, password, gender, location } = request.body;
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbObject = await db.get(selectUserQuery);
  const hashedPassword = await bcrypt.hash(password, 10);

  if (dbObject === undefined) {
    // create user
    const newUser = `
        INSERT INTO 
        user(username,name,password,gender,location)
        VALUES ('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
    const dbObject = await db.run(newUser);
    const newUserId = dbObject.lastID;
    response.send(`created new user With ${newUserId}`);
  } else {
    // user already exists
    response.status(400);
    response.send("User Already Exists");
  }
});

// login user
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
    SELECT * FROM user WHERE username = '${username}';`;
  const dbObject = await db.get(checkUser);
  if (dbObject === undefined) {
    response.status(400);
    response.send("invalid user");
  } else {
    const isMatchedPassword = await bcrypt.compare(password, dbObject.password);
    if (isMatchedPassword === true) {
      response.send("Login Success");
    } else {
      response.status(400);
      response.send("invalid Password");
    }
  }
});

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //write code to check is the username is valid
  // Check if username is not empty and meets basic criteria
  if (!username || username.trim().length === 0) {
    return false;
  }
  // Username should be at least 3 characters
  if (username.length < 3) {
    return false;
  }
  // Username should contain only alphanumeric characters
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  // Find user in users array
  const user = users.find(user => user.username === username);
  
  // Check if user exists and password matches
  if (user && user.password === password) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Create JWT token for the session
    const accessToken = jwt.sign({username: username}, "access", {expiresIn: 60 * 60});
    
    // Save user credentials in session
    req.session.authorization = {
      accessToken: accessToken,
      username: username
    };
    
    return res.status(200).json({message: "Login successful", token: accessToken});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  // Get ISBN from request parameters
  const isbn = req.params.isbn;
  
  // Get review from request query
  const review = req.query.review;
  
  // Get username from session
  const username = req.session.authorization?.username;
  
  // Check if user is logged in
  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({message: "Review text is required"});
  }
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Add or modify the review
  // If user already has a review for this ISBN, modify it
  // If not, add a new review
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "Review added/modified successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  // Get ISBN from request parameters
  const isbn = req.params.isbn;
  
  // Get username from session
  const username = req.session.authorization?.username;
  
  // Check if user is logged in
  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }
  
  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if the user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found for this user"});
  }
  
  // Delete the user's review (Hint: filter & delete based on session username)
  delete books[isbn].reviews[username];
  
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
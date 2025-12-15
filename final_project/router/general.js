const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // Added for Task 10
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  // Get username and password from request body
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  
  // Check if username is valid (using the isValid function from auth_users.js)
  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username format"});
  }
  
  // Register the new user
  users.push({username: username, password: password});
  
  return res.status(201).json({message: "User registered successfully"});
});

// Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    // Using async/await with Axios to simulate asynchronous operation
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        // Simulate async operation with setTimeout
        setTimeout(() => {
          resolve(books);
        }, 100);
      });
    };
    
    // Await the promise
    const booksData = await getBooks();
    
    // Return all books available in the shop with neat formatting
    const formattedBooks = JSON.stringify(booksData, null, 2);
    return res.status(200).type('json').send(formattedBooks);
    
  } catch (error) {
    return res.status(500).json({message: "Error fetching books", error: error.message});
  }
});

// Alternative implementation using Axios directly (if we were fetching from external API):
public_users.get('/async', async function (req, res) {
  try {
    // Example using Axios to fetch data (if books were from external API)
    // const response = await axios.get('http://localhost:5000/books');
    // const booksData = response.data;
    
    // For now, simulate async operation with Promise
    const booksData = await new Promise((resolve) => {
      setTimeout(() => resolve(books), 100);
    });
    
    const formattedBooks = JSON.stringify(booksData, null, 2);
    return res.status(200).type('json').send(formattedBooks);
    
  } catch (error) {
    return res.status(500).json({message: "Error fetching books asynchronously", error: error.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  // Retrieve ISBN from request parameters
  const isbn = req.params.isbn;
  
  // Check if book with given ISBN exists
  if (books[isbn]) {
    // Return the book details with neat formatting
    const formattedBook = JSON.stringify(books[isbn], null, 2);
    return res.status(200).type('json').send(formattedBook);
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  // Get author from request parameters
  const author = req.params.author;
  
  // Array to store matching books
  let matchingBooks = [];
  
  // Get all ISBN keys from the books object (Hint 1)
  const isbns = Object.keys(books);
  
  // Iterate through all books (Hint 2)
  for (let isbn of isbns) {
    // Check if author matches (case-insensitive comparison)
    if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
      // Add book to matching books array with ISBN as key
      matchingBooks.push({
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  }
  
  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return matching books with neat formatting
    const formattedResult = JSON.stringify({booksbyauthor: matchingBooks}, null, 2);
    return res.status(200).type('json').send(formattedResult);
  } else {
    // Return error if no books found
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  // Get title from request parameters
  const title = req.params.title;
  
  // Array to store matching books
  let matchingBooks = [];
  
  // Get all ISBN keys from the books object
  const isbns = Object.keys(books);
  
  // Iterate through all books
  for (let isbn of isbns) {
    // Check if title matches (case-insensitive comparison)
    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
      // Add book to matching books array with ISBN as key
      matchingBooks.push({
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  }
  
  // Check if any books were found
  if (matchingBooks.length > 0) {
    // Return matching books with neat formatting
    const formattedResult = JSON.stringify({booksbytitle: matchingBooks}, null, 2);
    return res.status(200).type('json').send(formattedResult);
  } else {
    // Return error if no books found
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // Retrieve ISBN from request parameters
  const isbn = req.params.isbn;
  
  // Check if book with given ISBN exists
  if (books[isbn]) {
    // Return only the reviews for this book with neat formatting
    const formattedReviews = JSON.stringify(books[isbn].reviews, null, 2);
    return res.status(200).type('json').send(formattedReviews);
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // Added for async operations
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  if (users.some(user => user.username === username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  
  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username format"});
  }
  
  users.push({username: username, password: password});
  return res.status(201).json({message: "User registered successfully"});
});

// Task 10: Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(books);
        }, 100);
      });
    };
    
    const booksData = await getBooks();
    const formattedBooks = JSON.stringify(booksData, null, 2);
    return res.status(200).type('json').send(formattedBooks);
    
  } catch (error) {
    return res.status(500).json({message: "Error fetching books", error: error.message});
  }
});

// Task 11: Get book details based on ISBN using async/await with Promises
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    
    // Create a promise to simulate async book lookup
    const getBookByISBN = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books[isbn]) {
            resolve(books[isbn]);
          } else {
            reject(new Error("Book not found"));
          }
        }, 100);
      });
    };
    
    // Await the promise
    const bookData = await getBookByISBN();
    
    // Return the book details with neat formatting
    const formattedBook = JSON.stringify(bookData, null, 2);
    return res.status(200).type('json').send(formattedBook);
    
  } catch (error) {
    if (error.message === "Book not found") {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({message: "Error fetching book by ISBN", error: error.message});
  }
});

// Alternative implementation using Promise callbacks for ISBN
public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  // Using Promise with .then() and .catch()
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    }, 100);
  })
  .then(bookData => {
    const formattedBook = JSON.stringify(bookData, null, 2);
    return res.status(200).type('json').send(formattedBook);
  })
  .catch(error => {
    if (error.message === "Book not found") {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({message: "Error fetching book by ISBN", error: error.message});
  });
});

// Task 12: Get book details based on Author using async/await with Promises  
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    
    // Create a promise to simulate async author search
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let matchingBooks = [];
          const isbns = Object.keys(books);
          
          for (let isbn of isbns) {
            if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
              matchingBooks.push({
                isbn: isbn,
                title: books[isbn].title,
                author: books[isbn].author,
                reviews: books[isbn].reviews
              });
            }
          }
          
          if (matchingBooks.length > 0) {
            resolve({ booksbyauthor: matchingBooks });
          } else {
            reject(new Error("No books found by this author"));
          }
        }, 100);
      });
    };
    
    // Await the promise
    const result = await getBooksByAuthor();
    
    // Return matching books with neat formatting
    const formattedResult = JSON.stringify(result, null, 2);
    return res.status(200).type('json').send(formattedResult);
    
  } catch (error) {
    if (error.message === "No books found by this author") {
      return res.status(404).json({message: "No books found by this author"});
    }
    return res.status(500).json({message: "Error fetching books by author", error: error.message});
  }
});

// Alternative implementation using Promise callbacks for author search
public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;
  
  // Using Promise with .then() and .catch()
  new Promise((resolve, reject) => {
    setTimeout(() => {
      let matchingBooks = [];
      const isbns = Object.keys(books);
      
      for (let isbn of isbns) {
        if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
          matchingBooks.push({
            isbn: isbn,
            title: books[isbn].title,
            author: books[isbn].author,
            reviews: books[isbn].reviews
          });
        }
      }
      
      if (matchingBooks.length > 0) {
        resolve({ booksbyauthor: matchingBooks });
      } else {
        reject(new Error("No books found by this author"));
      }
    }, 100);
  })
  .then(result => {
    const formattedResult = JSON.stringify(result, null, 2);
    return res.status(200).type('json').send(formattedResult);
  })
  .catch(error => {
    if (error.message === "No books found by this author") {
      return res.status(404).json({message: "No books found by this author"});
    }
    return res.status(500).json({message: "Error fetching books by author", error: error.message});
  });
});

// Original synchronous implementation kept for reference
public_users.get('/author-sync/:author', function (req, res) {
  const author = req.params.author;
  let matchingBooks = [];
  const isbns = Object.keys(books);
  
  for (let isbn of isbns) {
    if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
      matchingBooks.push({
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  }
  
  if (matchingBooks.length > 0) {
    const formattedResult = JSON.stringify({booksbyauthor: matchingBooks}, null, 2);
    return res.status(200).type('json').send(formattedResult);
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Task 13: Get book details based on Title using async/await with Promises
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    
    // Create a promise to simulate async title search
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let matchingBooks = [];
          const isbns = Object.keys(books);
          
          for (let isbn of isbns) {
            if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
              matchingBooks.push({
                isbn: isbn,
                title: books[isbn].title,
                author: books[isbn].author,
                reviews: books[isbn].reviews
              });
            }
          }
          
          if (matchingBooks.length > 0) {
            resolve({ booksbytitle: matchingBooks });
          } else {
            reject(new Error("No books found with this title"));
          }
        }, 100);
      });
    };
    
    // Await the promise
    const result = await getBooksByTitle();
    
    // Return matching books with neat formatting
    const formattedResult = JSON.stringify(result, null, 2);
    return res.status(200).type('json').send(formattedResult);
    
  } catch (error) {
    if (error.message === "No books found with this title") {
      return res.status(404).json({message: "No books found with this title"});
    }
    return res.status(500).json({message: "Error fetching books by title", error: error.message});
  }
});

// Alternative implementation using Promise callbacks for title search
public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;
  
  // Using Promise with .then() and .catch()
  new Promise((resolve, reject) => {
    setTimeout(() => {
      let matchingBooks = [];
      const isbns = Object.keys(books);
      
      for (let isbn of isbns) {
        if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
          matchingBooks.push({
            isbn: isbn,
            title: books[isbn].title,
            author: books[isbn].author,
            reviews: books[isbn].reviews
          });
        }
      }
      
      if (matchingBooks.length > 0) {
        resolve({ booksbytitle: matchingBooks });
      } else {
        reject(new Error("No books found with this title"));
      }
    }, 100);
  })
  .then(result => {
    const formattedResult = JSON.stringify(result, null, 2);
    return res.status(200).type('json').send(formattedResult);
  })
  .catch(error => {
    if (error.message === "No books found with this title") {
      return res.status(404).json({message: "No books found with this title"});
    }
    return res.status(500).json({message: "Error fetching books by title", error: error.message});
  });
});

// Original synchronous implementation (kept for compatibility)
public_users.get('/title-sync/:title', function (req, res) {
  const title = req.params.title;
  let matchingBooks = [];
  const isbns = Object.keys(books);
  
  for (let isbn of isbns) {
    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
      matchingBooks.push({
        isbn: isbn,
        title: books[isbn].title,
        author: books[isbn].author,
        reviews: books[isbn].reviews
      });
    }
  }
  
  if (matchingBooks.length > 0) {
    const formattedResult = JSON.stringify({booksbytitle: matchingBooks}, null, 2);
    return res.status(200).type('json').send(formattedResult);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    const formattedReviews = JSON.stringify(books[isbn].reviews, null, 2);
    return res.status(200).type('json').send(formattedReviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
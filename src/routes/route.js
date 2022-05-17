const express = require("express"); //import express
const router = express.Router(); //used express to create route handlers
const userController = require("../Controller/userController")
const bookController = require("../Controller/bookController")
const reviewController = require("../Controller/reviewController")
const {Authentication,Authorization} = require("../middleware/auth")

//user APIs
router.post('/register', userController.Register)
router.post("/login",userController.Login)

//Book APIs
router.route('/books')
.post(Authentication,Authorization, bookController.Book)
.get(Authentication, bookController.getBooks)

router.route('/books/:bookId')
.get(Authentication, bookController.getBooksBybookId)
.put(Authentication,Authorization, bookController.updateBook)
.delete(Authentication,Authorization,bookController.deleteBook)

//review APIs
router.post("/books/:bookId/review",reviewController.createReview)
router.route('/books/:bookId/review/:reviewId')
.put(reviewController.updateReviews)
.delete(reviewController.deleteReviews)

//export router
module.exports = router;

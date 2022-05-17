const reviewModel = require("../Models/reviewModel");
const bookModel = require("../Models/bookModel");
const Validator = require("../Validator/valid");


//create review function
const createReview = async function(req, res) {
    try {
        //reading book id from path param
        const bookId = req.params.bookId;

        if(!Validator.isValid(bookId)) return res.status(400).send({status: false,message: "book Id is Required"});
        //validation of user id
        if(!Validator.isValidObjectId(bookId))  return res.status(400).send({status: false,message: "book Id is not valid"});

        
        //reading input from req.body
        const data = req.body;
        const { reviewedBy,reviewedAt,rating, review} = data;//destructuring data

        //check req.body is empty or not
        if(Object.keys(data).length == 0){return res.status(400).send({status:false,msg:"No data provided!"})}
        //check reviewedBy Required!! 
        if (reviewedBy === undefined) return res.status(400).send({ status: false, msg: "reviewedBy Required!!"});
        if (Object.values(reviewedBy).length > 0) {
            if(!/^[   A-Za-z ]+$/.test(reviewedBy))  return res.status(400).send({ status: false, msg: "reviewedBy should be accept string!!"});
        }
       
        if(!Validator.isValid(reviewedAt)) return res.status(400).send({status: false,message: "reviewedAt is Required"});
        if(!Validator.isValidDate(reviewedAt)) return res.status(400).send({status : false , message : "reviewedAt should be in YYYY-MM-DD format"})

        //check review is valid or not
        if(!Validator.isValid(review)) return res.status(400).send({status: false,message: "review is Required"});
        if(!Validator.isValidString(review))  return res.status(400).send({status: false, message: "review should be string"});

        //check rating is valid or not
        if(!Validator.isValid(rating)) return res.status(400).send({status: false,message: "rating is Required"});
        if(!/^[1-5]{1,2}$/.test(rating)) return res.status(400).send({status: false,message: "rating is not valid : should be min 1 and max 5"});

        if(data.isDeleted&&data.isDeleted!=false) return res.status(400).send({status : false , message : "Newly created reviews can only have isDeleted : false"})



        let fieldToUpdate = {
            bookId : req.params.bookId,
            reviewedBy : req.body.reviewedBy.trim(),
            reviewedAt:req.body.reviewedAt,
            rating : req.body.rating,
            review : req.body.review
        };
        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];  
        }

        const bookReview = await bookModel.findByIdAndUpdate(bookId, {$inc:{reviews: 1}}).select({reviews:1,_id:0});
        const reviewData = await reviewModel.create(fieldToUpdate)

       
        let temp = JSON.stringify(reviewData);
        let obj = JSON.parse(temp);
      
        obj.BookReview = bookReview;
        //create review
        return res.status(201).send({ status: true, message: "success",  data: obj});

    }catch(error) {
        return res.status(500).send({status : false, message: error.message});

    }
}

const updateReviews = async function(req,res){
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;
       
        let fieldToUpdate = {
            reviewedBy : req.body.reviewedBy,
            rating : req.body.rating.trim(),
            review : req.body.review
        };
        if(!Validator.isValid(bookId)) return res.status(400).send({status: false,message: "book Id is Required"});
        //validation of user id
        if(!Validator.isValidObjectId(bookId))  return res.status(400).send({status: false,message: "book Id is not valid"});

        if (!Validator.isValid(reviewId)) return res.status(400).send({ status: false, message: "reviewId is Required" });
        if (!Validator.isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "reviewId is not valid" });

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
            
        }
        let book = await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!book) return res.status(404).send({ status: false, message: "book with this id does not exist"});

        if(bookId.reviews!=0){
        let reviews = await reviewModel.findOneAndUpdate({_id:reviewId,isDeleted:false} ,{ $set : {...fieldToUpdate}}, {new : true})
        console.log(reviews)
        if(!reviews) return res.status(404).send({ status: false, message: "review with this id does not exist"});

        if (reviews.bookId.toString() !== bookId) return res.status(403).send({status: false, message: `review is not from Book - ${book.title}`});

      
        let temp = JSON.stringify(book);
        let obj = JSON.parse(temp);
        
        obj.reviews = reviews;
        return res.status(200).send({ status: false, message: "success", data : obj});
        }

    }
    catch(err){
    return res.status(500).send({message : err.message})
    }
}

const deleteReviews = async function(req,res){
    try{
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        if(!Validator.isValid(bookId)) return res.status(400).send({status: false,message: "book Id is Required"});
        //validation of user id
        if(!Validator.isValidObjectId(bookId))  return res.status(400).send({status: false,message: "book Id is not valid"});


        let book = await bookModel.findOne({_id:bookId,isDeleted:false})
      
        if(!book) return res.status(404).send({status : false , message : "book with this id does not exist"})
        else{

        if (!Validator.isValid(reviewId)) return res.status(400).send({ status: false, message: "reviewId is Required" });
        if (!Validator.isValidObjectId(reviewId)) return res.status(400).send({ status: false, message: "reviewId is not valid" });

        let reviews = await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!reviews) return res.status(404).send({status : false , message : "review with this id does not exist"})
       
        if (reviews.bookId.toString() !== bookId) return res.status(403).send({status: false, message: `review is not from Book - ${book.title}`});

        reviews.isDeleted = true;
        await reviews.save();
        book.reviews = book.reviews-1
        await book.save();

        return res.status(200).send({status : true , message : "success"})
        }
    }
    catch(err){
        return res.status(500).send({message : err.message})
    } }

module.exports = { createReview,updateReviews,deleteReviews}






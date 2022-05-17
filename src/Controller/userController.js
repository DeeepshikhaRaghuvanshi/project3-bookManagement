const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const Validator = require("../Validator/valid")


/************************************************ Create User data ************************************************** */

const Register = async function (req, res) {
    try{
        let data = req.body

        let {title, name, phone, email, password} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user data"})}
       
        if(!Validator.isValid(title)) return res.status(400).send({status: false,message: "Title is Required"});
        if (!Validator.isValidTitle(title)) return res.status(400).send({ status: false, message: "Title must be : Mr/ Miss/ Mrs" })
        
        if(!Validator.isValid(name)) return res.status(400).send({status: false,message: "Name is Required"});
        if(!Validator.isValidString(name)) return res.status(400).send({status: false, message: "Invalid name : Should contain alphabetic characters only"});
       
        if(!Validator.isValid(phone)) return res.status(400).send({status: false,message: "Phone is Required"});
        if (!Validator.isValidPhone(phone))  return res.status(400).send({ status: false, message: "Invalid phone number : must contain 10 digit and only number."});

        //check unique phone
        const isPhoneUsed = await userModel.findOne({phone: phone });
        if (isPhoneUsed) return res.status(400).send({ status: false, message:"phone is already used, try different one"});

        if(!Validator.isValid(email)) return res.status(400).send({status: false,message: "Email is Required"});
        if (!Validator.isValidEmail(email)) return res.status(400).send({ status: false, message: "Invalid email address"});

        //check unique email
        const isEmailUsed = await userModel.findOne({email: email });
        if (isEmailUsed) return res.status(400).send({ status: false, message:  "email is already used, try different one"});

        if(!Validator.isValid(password)) return res.status(400).send({status: false,message: "Password is Required"});
        if (!Validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "Invalid password (length : 8-16) : Abcd@123456"});

        if(!/^[0-9]{6}$/.test(data.address.pincode)) return res.status(400).send({status: false,message: "Pincode  is not valid minlenght:-6"});

        /*-------------------create user ---------------------------------------------*/ 
        let savedData = await userModel.create(data);
        return res.status(201).send({ status: true, data: savedData});
    }
    catch(err){
       return res.status(500).send({ status : false , message: err.message});
    }
};


/**************************************** Login user ******************************************/

const Login =async function(req,res){
    try{
        let data =req.body
        const{ email, password} = data

        /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user details"})}
       
        if(!Validator.isValid(email)){ return res.status(400).send({status: false,message: "Email is Required"});}
      
        if(!Validator.isValid(password)){return res.status(400).send({status: false,message: "Password is Required"});}
       
        let logCheck = await userModel.findOne({email:email,password:password});
        if(!logCheck){
            return res.status(400).send({ status: false, message: "This email id and password not valid"});
        }
       
        //create the jwt token 
        let token = jwt.sign({
            userId:logCheck._id.toString(),
            group:7

        },"project3Group7",{expiresIn: "1200s" });
        res.setHeader("x-api-key", token);
       
       return res.status(200).send({ status: true, message: "Login Successful",iat:new String(Date()),token: token})
    }
    catch(err){
        return res.status(500).send({status : false , message: err.message});
    }
}

module.exports = {Register, Login}






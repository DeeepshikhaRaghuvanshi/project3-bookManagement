const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
            enum: ["Mr", "Mrs", "Miss"],
            trim: true
        },
        name: {
            type: String,
            trim: true
        },
        phone: {
            type: Number,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            lowercase:true
        },
        password: {
            type: String,
            trim: true,
            lowercase:true
        },
        address: {
            street: { type: String },
            city: { type:String },
            pincode: { 
                type: Number,
                minlength : 6
             }, 

        },
    }, { timestamps: true });

module.exports = mongoose.model('User', userSchema)
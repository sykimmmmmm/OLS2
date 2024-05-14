const mongoose = require('mongoose')
const { Schema } = mongoose
const moment = require('moment')

const bookSchema = new Schema({
    title:{
        type: String,
        required: true,
        
    },
    summary:{
        type: String,
    },
    release: {
        type: String,
    },
    author: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default : Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    category:{
        type:String,
        required: true
    },
    isbn:{
        type:String,
        required: true,
        unique:true
    }
})

bookSchema.path('isbn').validate(function(value){
    return /\d{3}-\d{2}-\d{6}-\d{1}-\d{1}/.test(value)
},'book {VALUE} 13자리 중복x이여야합니다')

bookSchema.path('category').validate(function(value){
    return /철학|과학|신화|자기계발|추리소설|요리책|여행/.test(value)
},'book {VALUE}는 철학|과학|신화|자기계발|추리소설|요리책|여행 중 하나여야합니다')

bookSchema.virtual('synopsis').get(function(){
    const synopsis = this.summary.split('').slice(0,20).join('')
    return synopsis
})

const Book = mongoose.model('Book',bookSchema)
module.exports = Book
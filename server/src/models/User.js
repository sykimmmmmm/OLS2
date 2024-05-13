const mongoose = require('mongoose')
const moment = require('moment')
const { Schema } = mongoose
const { Types:{ ObjectId } } = Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    checkOutBooks:[{type: ObjectId, ref:'Book'}],
    createAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
})

userSchema.path('name').validate(function(value){
    return /^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z|A-Z]+$/.test(value)
},'user `{VALUE}` 잘못된 형식 소문자와 대문자로 만드세요')

userSchema.path('email').validate(function(value){
    return /^[a-zA-Z0-9]+@{1}[a-z]+(\.[a-z]{2})?(\.[a-z]{2,3})$/.test(value)
},'user `{VALUE}` 잘못된형식')

userSchema.path('password').validate(function(value){
    return /^(?=.*[0-9])(?=.*[~!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}/.test(value)
},'user `{VALUE}` 잘못된형식')

userSchema.virtual('recentlyLogin').get(function(){
    const loginTime = moment().locale('ko')
    return loginTime.fromNow()
})

const User = mongoose.model('User',userSchema)
module.exports = User

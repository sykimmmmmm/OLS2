const mongoose = require('mongoose')
const { Schema } = mongoose
const { Types:{ ObjectId } } = Schema
const moment = require('moment')

const historySchema = new Schema({
    borrowAt : {
        type: Date,
        required: true,
        default: moment()
    },
    returnAt : {
        type: Date,
        default: null
    },
    bookId : {type: ObjectId, ref:'Book'},
    userId : {type: ObjectId, ref:'User',required:true},
    expiredAt :{
        type: Date,
        required: true,
        default: moment().add(14,'days')
    },
    status :{
        type: String,
        required : true
    }
})

historySchema.path('status').validate(function(value){
    return /대출|반납|연체|연장/.test(value)
},'user `{VALUE}` 잘못된 형태')


/* 남은 기간 보여주기 */
historySchema.virtual('restTime').get(function(){
    return moment(this.expiredAt).locale('ko').fromNow()
})

/* 연체 체크를 위한 가상필드 */
historySchema.virtual('expire').get(function(){
    return moment(this.expiredAt).diff(moment(),'days')
})


const History = mongoose.model('History',historySchema)
module.exports = History
const express = require('express')
const User = require('../models/User')
const History = require('../models/History')
const expressAsyncHandler = require('express-async-handler')
const { isAuth,isAdmin }= require('../../auth')
const Book = require('../models/Book')
const mongoose = require('mongoose')
const {Types:{ ObjectId }} = mongoose
const moment = require('moment')
const router = express.Router()
const {limiter} = require('../../limit')

/* 책 카테고리별 관리자 통계 */
router.get('/group/:field',isAuth,limiter, isAdmin, isFilterValid, expressAsyncHandler( async (req,res,next)=>{
    const docs = await Book.aggregate([
        {
            $group:{
                _id:`$${req.params.field}`,
                count: {$sum : 1}
            }
        },
        {
            $sort:{_id: 1}
        }
    ])
    console.log(`Number of group : ${docs.length}`)
    res.json({code: 200, docs})
}))



/* 개인 히스토리로 본인의 책 카테고리 확인 */
router.get('/group/mine/:field',isAuth,limiter, isFilterValid, expressAsyncHandler( async (req,res,next)=>{
    const docs = await History.aggregate([
        {
            $match:{ userId : new ObjectId(req.user._id) }
        },
        {
            $lookup:{
                from:'books',
                localField:'bookId',
                foreignField:'_id',
                as: 'books'
            }
        },
        {
            $replaceRoot:{
                newRoot:{
                    $mergeObjects:[{$arrayElemAt:['$books',0]},"$$ROOT"]
                }
            }
        },
        {
            $group:{
                _id: `$${req.params.field}`,
                count:{$sum:1}
            }
        },
        {
            $sort:{ _id: 1}
        }
    ])
    console.log(`Number of group : ${docs.length}`)
    res.json({code: 200, docs})
}))

/* 책 대출현황 확인  조회할때 반납날 초과시 연체변경 */
router.get('/',isAuth,limiter, expressAsyncHandler(async (req,res,next)=>{
    const history = await History.find({
        userId : req.user._id
    }).populate('userId',['-_id','name']).populate('bookId',['-_id'])
    if(!history){
        res.status(404).json({code:404,message:'no history'})
    }else{
        const refinedHistory = await Promise.all(
        history.map(async(hs) => {
            let {borrowAt, expiredAt, restTime, returnAt, bookId, userId, status, expire} = hs
            if(expire<0){
                hs.status = '연체'
                const newHs = await hs.save()
                const {borrowAt, expiredAt, restTime, returnAt, bookId, userId, status, expire} = newHs
                return {borrowAt, expiredAt, restTime, returnAt, bookId, userId, status, expire}
            }
            return {borrowAt, expiredAt, restTime, returnAt, bookId, userId, status, expire}
        }))
        // console.log(refinedHistory)
        res.json({code:200, refinedHistory})
    }
}))


module.exports = router

function isFilterValid(req,res,next){
    const fields = ['category']
    if(fields.includes(req.params.field) ){
        next()
    }else{
        res.status(400).json({code:400, message:'you gave wrong field to group documents !'})
    }
}
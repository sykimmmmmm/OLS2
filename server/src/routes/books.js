const express = require('express')
const User = require('../models/User')
const Book = require('../models/Book')
const History = require('../models/History')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')
const moment = require('moment')
const { limiter } =require('../../limit')
const router = express.Router()



/* 책빌리기 및 히스토리 추가 */
router.post('/borrow',isAuth,limiter, expressAsyncHandler(async (req,res,next)=>{
    const book = await Book.findOne({
        isbn: req.body.isbn
    })
    const user = await User.findById(req.user._id)
    
    if(!user){
        res.status(404).json({code:404,message:"user not Found!"})
    }else if(!book){
        res.status(404).json({code:404,message:'this book not exists'})
    }else if(user.checkOutBooks.includes(book._id)){
        res.json({code:204, message:'이미 빌린책입니다'})
    }else{
        const history = new History({
            userId : req.user._id,
            bookId : book._id,
            status : '대출',
        })
        const newHistory = await history.save()
        await user.populate('checkOutBooks','-_id')
        user.checkOutBooks.push(book)
        user.lastModifiedAt = new Date()
        const updatedUser = await user.save()
        res.json({code:200, message:"책을 빌렸습니다",updatedUser, newHistory})
    }
}))

/* 책반납 및 히스토리 상태 변경*/
router.delete('/borrow/:id',isAuth,limiter, expressAsyncHandler(async (req,res,next)=>{
    const book = await Book.findById(req.params.id)
    const user = await User.findById(req.user._id)
    const history = await History.findOne({
        userId : req.user._id,
        bookId : req.params.id,
        status : {$in:['대출','연장','연체']}
    })
    if(!user){
        res.status(404).json({code:404,message:'user not Found!'})
    }else if(!book){
        res.status(404).json({code:404, message:"없는 책입니다"})
    }else if(!user.checkOutBooks.includes(book._id)){
        res.status(404).json({code:404, message:'빌린 책이 아닙니다'})
    }else{
        await user.populate('checkOutBooks')
        user.checkOutBooks.pull(book)
        user.lastModifiedAt = new Date()
        const updatedUser = await user.save()
        history.returnAt = new Date()
        history.status = '반납'
        const updatedHistory = await history.save()
        res.json({code:200,message:'반납했습니다',updatedUser , updatedHistory})
    }
}))

/* 책 연장신청 및 히스토리 연장 변경 */
router.put('/borrow/:bookId',isAuth,limiter,expressAsyncHandler(async (req,res,next)=>{
    const history = await History.findOne({
        userId : req.user._id,
        bookId : req.params.bookId,
        status : {$in:['대출','연장','연체']}
    })
    if(!history){
        res.status(404).json({code:404, message:'no histoy'})
    }else{
        history.expiredAt = moment(history.expiredAt).add(7,'days')
        history.status = '연장'
        const newHistory = await history.save()
        res.json({code:200, message:"7일 연장했습니다" ,newHistory})
    }
}))

/* 대출책조회 */
router.get('/borrow',isAuth,limiter, expressAsyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user._id).populate('checkOutBooks',['-_id'])
    if(!user){
        res.status(404).json({code:404,message:'없는 사용자입니다'})
    }else{
        const { checkOutBooks } = user
        const refinedBooks = checkOutBooks.map(book=>{
            return {...book._doc,synopsis:book.synopsis}
        })
        if(checkOutBooks.length>0){
            res.json({code:200, refinedBooks})
        }else{
            res.json({code:404,message:'대출중인 책이없습니다', checkOutBooks})
        }
    }
}))

/* 대출중인책 상세조회 */
router.get('/borrow/:isbn',isAuth,limiter, expressAsyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.user._id).populate('checkOutBooks')
    if(!user){
        res.status(404).json({code:404,message:'없는 사용자'})
    }else{
        const book = await Book.findOne({isbn: req.params.isbn})
        res.json({code:200 , book})
    }
}))

/* 비회원유저포함 책조회가능 */
router.get('/', limiter, expressAsyncHandler(async (req,res,next)=>{
    const books = await Book.find({})
    const refinedBooks = books.map(book=>{
        return {...book._doc,synopsis:book.synopsis}
    })
    if(!books){
        res.status(404).json({code:404,message:'No Books...'})
    }else{
        res.json({code:200, refinedBooks})
    }
}))

/* 비회원포함 책 상세보기 */
router.get('/:isbn',limiter, expressAsyncHandler(async (req,res,next)=>{
    const book = await Book.findOne({isbn:req.params.isbn})
    if(!book){
        res.status(404).json({code:404,message:'No Book'})
    }else{
        res.json({code:200, book})
    }
}))



module.exports = router
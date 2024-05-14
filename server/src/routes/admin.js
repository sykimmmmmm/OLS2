const express = require('express')
const User = require('../models/User')
const Book = require('../models/Book')
const expressAsyncHandler = require('express-async-handler')
const { isAdmin , isAuth }= require('../../auth')
const {oneOf,validationResult} = require('express-validator')
const {validateBookTitle,validateBookSummary,validateBookCategory,validateBookIsbn} = require('../../validator')
const router = express.Router()

const validateBook = [validateBookTitle(),validateBookSummary(),validateBookCategory(),validateBookIsbn()]

/* 책추가 중복체크 */
router.post('/book',isAuth, isAdmin,validateBook,expressAsyncHandler(async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({code:400,message:'Invalid Book Data', error: errors.array()})
    }else{
        const searchedBook = await Book.findOne({
            isbn: req.body.isbn
        })
        if(searchedBook){
            res.json({code:204,message:'Book is already existed'})
        }else{
            const book = new Book({
                title: req.body.title,
                summary: req.body.summary,
                release: req.body.release,
                author: req.body.author,
                isbn: req.body.isbn,
                category: req.body.category
            })
            try{
                const newBook = await book.save()
                res.status(201).json({code:201,message:'New Book Added',newBook})
            }catch(e){
                if(e.code===11000){
                    res.status(400).json({code:400,message:'isbn 중복'})
                }else{
                    res.status(401).json({code:401,message:'도서 정보 확인필요!'})
                }
            }
        }
    }
}))

/* 책 수정 */
router.put('/book/:isbn',isAuth, isAdmin,oneOf(validateBook), expressAsyncHandler(async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({code:400, message:'Invalid Form data for book', error:errors.array()})
    }else{
        const book = await Book.findOne({
            isbn: req.params.isbn
        })
        if(!book){
            res.status(404).json({code:404,message:'Book Not Found!'})
        }else{
            book.title = req.body.title || book.title
            book.summary = req.body.summary || book.summary
            book.author = req.body.author || book.author
            book.release = req.body.release || book.release
            book.lastModifiedAt = new Date()
            
            const updatedBook = await book.save()
            res.json({code:200, message:'Book Updated!', updatedBook})
        }
    }
}))

/* 도서 삭제 */
router.delete('/book/:id',isAuth, isAdmin, expressAsyncHandler(async (req,res,next)=>{
    const book = await Book.findByIdAndDelete(req.params.id)
    if(!book){
        res.status(404).json({code:404,message:'Book Not Found'})
    }else{
        res.status(204).json({code:204, message:'Book deletd successfully'})
    }
}))


module.exports = router



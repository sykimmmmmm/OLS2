const express = require('express')
const User = require('../models/User')
const expressAsyncHandler = require('express-async-handler')
const { generateToken , isAuth }= require('../../auth')
const {
    validateUserName,
    validateUserEmail,
    validateUserPassword,
} = require('../../validator')
const { validationResult,oneOf } = require('express-validator')
const History = require('../models/History')
const router = express.Router()

const validateRegister = [validateUserName(),validateUserEmail(),validateUserPassword()]

/* 회원가입 */
router.post('/register',validateRegister,expressAsyncHandler(async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({code:400, message:'Invalid Form data for user', error: errors.array()})
    }else{
        console.log(req.body)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            userId: req.body.userId
        })
        try{
            const newUser = await user.save()
            const {name, email, userId, isAdmin, createdAt} = newUser
            res.json({
                code:200, token:generateToken(newUser),
                name, email, userId, isAdmin, createdAt
            })
        }catch(e){
            console.log(e.name)
            res.status(400).json({code:400, message:'Invalid User Data'})
        }
    }
}))

/* 로그인 */
router.post('/login',[validateUserEmail(),validateUserPassword()],expressAsyncHandler( async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors.array())
        res.status(400).json({code:400 ,message:'Invalid Form data for user', error: errors.array()})
    }else{
        console.log(req.body)
        const loginUser = await User.findOne({
            email: req.body.email,
            password: req.body.password
        })
        if(!loginUser){
            res.status(401).json({code:401, message:'Invalid Email or Password'})
        }else{
            const {name, email, userId, isAdmin, createdAt, recentlyLogin} = loginUser
            res.json({
                code:200,
                token: generateToken(loginUser),
                name, email, userId, isAdmin, createdAt,recentlyLogin
            })
        }

    }
}))

/* 정보 수정 */
router.put('/', isAuth ,oneOf(validateRegister),expressAsyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user._id)
    if(!user){
        res.status(404).json({code:404, message:"User not Found"})
    }else{
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.password = req.body.password || user.password
        user.lastModifiedAt = new Date()
        
        const updatedUser = await user.save()
        const {name, email, userId, isAdmin, createdAt} = updatedUser
        res.json({
            code:200,
            token: generateToken(updatedUser),
            name, email, userId, isAdmin, createdAt
        })
    }
}))

/* 탈퇴 */
router.delete('/', isAuth, expressAsyncHandler(async (req,res,next)=>{
    const history = await History.findByIdAndDelete(req.user._id)
    const user = await User.findByIdAndDelete(req.user._id)
    if(!user){
        res.status(404).json({code:404, message:'User not Found'})
    }else{
        res.json({code:204, message:'User deleted successfully'})
    }
}))

module.exports = router



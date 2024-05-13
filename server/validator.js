const {body} = require('express-validator')
const User = require('./src/models/User')
const isFieldEmpty = (field) =>{
    return body(field)
           .notEmpty()
           .withMessage(`user ${field} is required`)
           .bail() //bail() 메서드 앞쪽 부분이 false 이면 더이상 뒤쪽의 데이터검증은 안함
           .trim() // 공백 제거
}

const validateUserName = () =>{
    return isFieldEmpty('name')
           .isLength({ min:2, max:20 }) // 회원이름 2~20자제한
           .withMessage(`user name length must be between 2~20 characters`)
}

const validateUserEmail = () =>{
    return isFieldEmpty('email')
           .isEmail() //이메일 형식에 맞는지 검사
           .withMessage(' user email is not valid')
}

const validateUserPassword =  () =>{
    return isFieldEmpty('password')
           .isLength({ min: 7 })
           .withMessage('password must be more than 7 characters')
           .bail()
           .isLength({ max: 15 })
           .withMessage('password must be lesser than 15 characters')
           .bail()
           .matches(/[A-Za-z]/)
           .withMessage('password must be at least 1 character')
           .matches(/[0-9]/)
           .withMessage('password must be at least 1 number')
           .matches(/[~!@#$%^&*]/)
           .withMessage('password must be at least 1 special character')
           .bail()//value 는 요청본문에서 전달된 비밀번호
           .custom((value,{ req })=> {
            if(req.path === '/register'){
                return req.body.confirmPassword === value
            }else{ return true }
            })//필터메서드처럼 동작
           .withMessage("Password don't match")
           
}

const validateBookTitle = () => {
    return isFieldEmpty('title')
           .isLength({ max:100 })//
           .withMessage('book title length must be less than 100 characters')           
}

const validateBookSummary = () => {
    return isFieldEmpty('summary')
           .isLength({ max: 300 })//5~300자
           .withMessage('book summary must be less than 300 characters')
}

const validateBookCategory = () => {
    return isFieldEmpty('category')
           .isIn(['철학', '과학', '신화', '자기계발', '추리소설', '요리책', '여행'])
           .withMessage("book category must be one of '철학', '과학', '신화', '자기계발', '추리소설', '요리책', '여행'")
}

const validateBookIsbn = () =>{
    return isFieldEmpty('isbn')
           .isISBN({version:13})
           .withMessage('book ISBN must be 13자리')
}

module.exports = {
    validateUserName,
    validateUserEmail,
    validateUserPassword,
    validateBookTitle,
    validateBookSummary,
    validateBookCategory,
    validateBookIsbn
}

/* 
.custom( async (value,{ req })=> {
    if(req.body.confirmPassword){
        return req.body.confirmPassword === value
    }else{
        let pwd
        await User.findOne({email:req.body.email})
        .then(res=>{
            return pwd = res.password 
        })
        console.log(pwd)
        return pwd === value
    }//필터메서드처럼 동작 
    
}) */
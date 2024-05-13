const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('morgan')
const mongoose = require('mongoose')
const axios = require('axios')
const userRouter = require('./src/routes/users')
const borrowRouter = require('./src/routes/borrow')
const adminRouter = require('./src/routes/admin')
const historyRouter = require('./src/routes/history')
const config = require('./config')

const corsOptions = {
    origin: ['http://127.0.0.1:5500','http://127.0.0.1:5501','http://localhost:5501','http://localhost:3000','http://127.0.0.1:3000'],
    credentials: true
}
mongoose.connect(config.MONGODB_URL)
.then(()=>console.log('연동성공'))
.catch(e=>console.log(`연동실패 ${e}`))




/* 공통 미들웨어  */
app.use(cors(corsOptions))
app.use(express.json())
app.use(logger('tiny'))
/* ************************************************  */

app.use('/users',userRouter)
app.use('/admin',adminRouter)
app.use('/book',borrowRouter)
app.use('/history',historyRouter)

// app.get('/fetch',async(req,res)=>{
//     const response = await axios.get(DB_URL)
//     res.json(response.data)
// })

// app.get('/users/:uname/books',(req,res,next)=>{
//     res.json(books)
// })

// app.post('/users/:uname/books',
// async(req,res,next)=>{
//     const findedBook = await BookData.findOne({title:req.query.book})
//     if(findedBook == null){
//         await createBook(req.query.book).save()
//         return next()
//     }else{
//         next()
//     }
// },
// async(req,res,next)=>{
//     const userdata = req.body.info
//     const findedBook = await BookData.findOne({title:req.query.book})
//     let findedUser
//     if(userdata){
//         findedUser = await UserData.findOne({email:req.body.info.email})
//     }
//     const findUserBook = await UserData.findOne({checkOutBooks:{$in:[findedBook.id]}})
//     if(findedUser == null && userdata){
//         await createUser(userdata,findedBook).save()
//         return next()
//     }
//     if(findUserBook == null && findedUser){
//         let query = {_id:findedUser.id}
//         await UserData.updateOne(query,{$push:{checkOutBooks:findedBook.id}})
//         return next()
//     }
//     return next()
// },
// (req,res,next)=>{
//     console.log('post1')
//     if(req.query&&!books[req.user].includes(req.query.book)&&req.query.book !== ''){
//         books[req.user].push(req.query.book)
//         next()
//     }else{
//         res.json(`${req.query.book}은 이미 대출한 책이거나 없는 책 입니다.`)
//     }
// },(req,res,next)=>{
//     res.json(`${req.query.book}를 대출 하셨습니다`)
// })

// app.put('/users/:uname/books',(req,res,next)=>{
//     res.json('put')
// })
// app.delete('/users/:uname/books',(req,res,next)=>{
//     res.json('delete')
// })
// app.use('/users/:uname/books',router)





// router.use('/:name',(req,res,next)=>{
//     /** 대출목록에 검색한 책이 없으면 -1 있으면 해당 인덱스 */
//     req.index = books[req.user].indexOf(req.query.book)
//     req.pIndex = books[req.user].indexOf(req.params.name)
//     next()
// })

// router.get('/:name',(req,res,next)=>{
//     console.log('get2')
//     if(books[req.user].includes(req.params.name)){
//         // res.json({"대출중인 특정 도서 조회" : books[req.user][req.pIndex]})
//         res.json(books[req.user][req.pIndex])
//     }else{
//         res.json(`${req.params.name}은 대출목록에 없습니다.`)
//     }
// })

// router.put('/:name',(req,res,next)=>{
//     console.log('put1')
//     if(req.index !== -1){
//         return res.json(`${req.query.book}은 이미 대출목록에 있습니다`)
//     }else{
//         next()
//     }    
// },(req,res,next)=>{
//     if(req.query.book !== undefined){
//         books[req.user].splice(req.pIndex,1,req.query.book)
//         res.json(`${req.params.name}을 ${req.query.book}으로 교체하였습니다.`)
//     }else{
//         res.json('교환할 책을 입력해주세요')
//     }
// })

// router.delete('/:name',(req,res,next)=>{
//     console.log('del1')
//     if(books[req.user].includes(req.params.name)){
//         books[req.user].splice(req.pIndex,1)
//         res.json(`${req.params.name}을 반납했습니다.`)
//     }else{
//         res.json(`${req.params.name}은 대출 목록에 없습니다.`)
//     }
// })


app.listen(4000,()=>{
    console.log(`this port is 4000`)
})

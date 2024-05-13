const mongoose = require('mongoose')
const User = require('./src/models/User')
const Book = require('./src/models/Book')
const config = require('./config')

const category = ['철학', '과학', '신화', '자기계발', '추리소설', '요리책', '여행']
const users = [] //생성된 사용자를 저장
const books = [] //생성된 책들 저장
mongoose.connect(config.MONGODB_URL)//프로미스 
.then(()=> console.log('데이터베이스 연동'))
.catch(e=> console.log(`데이터 연결 실패!!! : ${e}`))

//랜덤 날짜 생성
const generateRandomDate = (from, to) => { //from - 시작날짜 to - 끝날짜
    const date = new Date(
        from.getTime() + Math.random() * (to.getTime() - from.getTime())
    )
    const year = date.getFullYear()
    let month = date.getMonth()+1
    let day = date.getDate()+1
    if(month>12){
        month -= 1
    }
    if(day>31){
        day = day-1
    }
    return `${year}-${month}-${day}`
}

// 배열에서 랜덤값 선택
const selectRandomValue = arr => {
    return arr[Math.floor(Math.random()*arr.length)]
}

//랜덤 문자열 생성
const generateRandomStr = n => {
    const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    const str = new Array(n).fill('a')
    return str.map(s => alphabet[Math.floor(Math.random()*alphabet.length)]).join('')
}
const generateRandomTitle = n =>{
    const korean = ['가','나','다','라','마','바','사','아','자','차','카','타','파','하']
    const str = new Array(n).fill('가')
    return str.map(s => korean[Math.floor(Math.random()*korean.length)]).join('')
}
const generateRandomNum = n =>{
    const num = [0,1,2,3,4,5,6,7,8,9]
    const isbn = new Array(n).fill(0)
    return isbn.map(s => num[Math.floor(Math.random()*num.length)]).join('')
}
const generateRandomSymbol = n =>{
    const symbols = ['`','~','!','@','#','$','%','^','&','*']
    const symbol = new Array(n).fill('~')
    return symbol.map(s => symbols[Math.floor(Math.random()*symbols.length)]).join('')
}
//사용자 데이터 생성 테스트
const createUsers = async (n, users) =>{
    console.log('creating users now...')
    for(let i = 0 ; i<n; i++){
        const user = new User({
            name: generateRandomStr(5),
            email: `${generateRandomStr(7)}@gmail.com`,
            userId: generateRandomStr(10),
            password: generateRandomStr(4)+generateRandomNum(4)+generateRandomSymbol(3),
        })
        users.push(await user.save())
    }
    return users
}

const createBooks = async (n, books) =>{
    console.log('creating books now...')
    for(let i=0;i<n;i++){
        const book = new Book({
            title: generateRandomTitle(5),
            summary: generateRandomStr(30),
            author: generateRandomTitle(3),
            category: selectRandomValue(category),
            release : generateRandomDate(new Date(1970,0,1), new Date()),
            isbn : `978-89-${generateRandomNum(6)}-${generateRandomNum(1)}-${generateRandomNum(1)}`
        })
        books.push(await book.save())
    }
    console.log(books)
    return books
}


//사용자와 해당 할일 순서대로 생성
const buildData = async (users,books) =>{
    // users = await createUsers(10,users)
    books = await createBooks(200,books)
}

buildData(users,books)
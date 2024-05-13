const expressRateLimit = require('express-rate-limit')

const isAdmin = async(user)=>{
    if(user.isAdmin === true){
        return true
    }else{
        return false
    }
}


const limiter = expressRateLimit({
    windowMs: 1 * 60 * 1000,
    limit : 100,
    handler(req,res){
        res.status(429).json({
            code:429,
            message:"You can use this service 100 times per minute!"
        })
    }
})

module.exports = {limiter}
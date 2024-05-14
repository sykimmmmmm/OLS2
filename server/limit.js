const expressRateLimit = require('express-rate-limit')


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
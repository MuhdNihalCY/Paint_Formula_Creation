var express = require('express');
var router = express.Router();


router.get('/',(req,res,next)=>{
    res.send("This is Dispatcher");
})

module.exports = router;
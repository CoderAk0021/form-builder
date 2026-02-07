const router = require('express').Router();
const jwt = require('jsonwebtoken');


router.post("/admin",  (req,res) => {
    try {
       const { username,password } = req.body;  
       if(username === process.env.USER && password === process.env.PASS) {
         const token =  jwt.sign({ username:username, password: password },'jsonsecretkey123');
         console.log('Token: ',token);
        return res.status(200).json({
            success : true,
            message : 'Welcome Admin'
        })}
        return res.status(200).json({
            success: false,
            message: 'Invalid Credentials'
        }) 
    } catch (error) {
        console.log('Error at Auth.js : ',error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
})

module.exports = router
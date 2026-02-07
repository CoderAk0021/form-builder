const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {checkCookies} = require('../middlewares/auth.middleware')


router.post("/admin/login",  (req,res) => {
    try {
       const { username,password } = req.body;  
       if(username === process.env.USER && password === process.env.PASS) {
         const token =  jwt.sign({ username:username, password: password },process.env.JWT_SECRET_KEY);
          res.cookie("token", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
          sameSite: "Strict",
          secure: true,
        });
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

router.get("/verify", checkCookies, (req, res) => {
  return res.status(200).json({ 
    success: true, 
    user: req.user 
  });
});


module.exports = router
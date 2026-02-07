const jwt = require('jsonwebtoken');

function checkCookies(req, res, next) {
  try {
    const { token } = req.cookies;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded) {
        req.user = decoded;
        return next();
      }
      return res.status(200).json({ success: false, message: "Invalid Token" });
    }
    return res.status(200).json({ success: false, message: "User Need to Login" });
  } catch (error) {
    console.log("Error at checkCookies : ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {checkCookies}



const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1]; // Extract 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    
    // We saved the id in the token during login
    // decoded.id comes from the payload we wrote in the login route
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
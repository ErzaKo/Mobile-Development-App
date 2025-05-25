const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Bearer <token>"
  console.log('Token received:', token);  // Log the token for debugging
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Invalid token:', err);  // Log error if the token is invalid
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;  // Attach user info to the request
    console.log('Decoded token:', req.user);  // Log decoded user info to see which user is being passed
    next();
  });
};

module.exports = authMiddleware;

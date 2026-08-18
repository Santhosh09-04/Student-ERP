const { verifyToken } = require("../utils/jwt")

/**
 * Middleware to authenticate requests using a JWT token
 * Reads token from Authorization header or httpOnly cookie
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  let token = authHeader && authHeader.split(" ")[1]

  // Fall back to cookie if no Authorization header
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." })
  }
}

/**
 * Middleware to restrict routes to specific roles
 * @param {string[]} roles - Allowed roles (e.g. ["admin"])
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Insufficient permissions." })
    }
    next()
  }
}

module.exports = { authenticateToken, authorize }
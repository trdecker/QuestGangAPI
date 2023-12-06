const jwt = require ("jsonwebtoken")

function requireAuth (req, res, next) {
    const token = req.headers.authorization

    // 401 if no authtoken
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  
    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), '') // TODO: get config.key
      req.user = {
        userId: decoded.userId,
        username: decoded.username
      }

      next()
    } catch (error) {
      // Invalid token, respond with an error
      res.status(401).json({ error: 'Unauthorized' })
    }
  }

module.exports =
  {
    requireAuth
  }
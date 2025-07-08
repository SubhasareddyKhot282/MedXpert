import jwt from "jsonwebtoken";
import Auth from "../modules/userAuth.js";

const getTokenFromRequest = (req) => {
  // Try to get token from cookies first
  const tokenFromCookie = req.cookies?.token;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

const authenticateUser = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        details: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, "hackathon");
      
      if (!decoded._id) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          details: 'Token missing user ID'
        });
      }

      const user = await Auth.findById(decoded._id);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found',
          details: 'The user associated with this token no longer exists'
        });
      }

      // Attach user info to request
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role
      };
      req.userId = user._id;
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        details: jwtError.message
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
};

const authenticateDoctor = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        details: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, "hackathon");
      
      if (!decoded._id) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          details: 'Token missing user ID'
        });
      }

      const user = await Auth.findById(decoded._id);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found',
          details: 'The user associated with this token no longer exists'
        });
      }

      if (user.role !== "doctor") {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied',
          details: 'Doctor role required'
        });
      }

      // Attach user info to request
      req.user = {
        _id: user._id,
        email: user.email,
        role: user.role
      };
      req.userId = user._id;
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        details: jwtError.message
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
};

export { authenticateUser, authenticateDoctor };
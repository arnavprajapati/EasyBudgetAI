import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
import { User } from "../models/User.js";
import { isSessionActive } from "../config/generateToken.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    console.log('🔑 Access Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(403).json({
        message: "Please Login - no token",
      });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Decoded Token:', decodedData);

    if (!decodedData) {
      return res.status(400).json({
        message: "token expired",
      });
    }

    const sessionActive = await isSessionActive(
      decodedData.id,
      decodedData.sessionId
    );

    console.log('🔄 Session Active:', sessionActive);

    if (!sessionActive) {
      const clearOptions = {
        path: "/",
        secure: true,
        sameSite: "none",
      };

      res.clearCookie("refreshToken", clearOptions);
      res.clearCookie("accessToken", clearOptions);
      res.clearCookie("csrfToken", clearOptions);

      return res.status(401).json({
        message: "Session Expired. You have been logged in from another device",
      });
    }

    const cacheUser = await redisClient.get(`user:${decodedData.id}`);

    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      req.sessionId = decodedData.sessionId;
      return next();
    }

    const user = await User.findById(decodedData.id).select("-password");

    console.log('👤 User Found:', user ? user.email : 'Not Found');

    if (!user) {
      return res.status(400).json({
        message: "no user with this id",
      });
    }

    await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

    req.user = user;
    req.sessionId = decodedData.sessionId;
    next();
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

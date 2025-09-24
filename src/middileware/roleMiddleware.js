// roleMiddleware.js
export const allowEditorOrAdmin = (req, res, next) => {
  try {
    // req.user should already be set by your authMiddleware after verifying JWT
    const { role } = req.user;

    if (role === "admin" || role === "editor") {
      return next(); 
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. Only admin or editor allowed",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

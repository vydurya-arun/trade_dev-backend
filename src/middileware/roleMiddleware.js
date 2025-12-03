// roleMiddleware.js
export const allowEditorOrAdmin = (req, res, next) => {
  try {
    // req.user should already be set by your authMiddleware after verifying JWT
    const { role } = req.user;

    if (role === "admin" || role === "editor") {
      return next(); 
    }

    return res.status(401).json({
      success: false,
      message: "Access denied. Only admin or editor allowed",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const SuperAdminRoleCheck = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "User is not logged in" });
    }

    const userRole = req.user?.role;

    if (userRole !== "superAdmin") {
      return res.status(401).json({ success: false, message: "Only superAdmin allowed" });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

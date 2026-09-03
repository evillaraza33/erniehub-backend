// ✅ Checks if logged-in user is ADMIN
const isAdmin = async (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    next();
  } else {
    return res.status(403).json({ error: "Admin access required" });
  }
};

module.exports = isAdmin;
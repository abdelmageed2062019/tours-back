const admin = (req, res, next) => {
  console.log(req.user);

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .send(
        "Access denied. You do not have permission to perform this action."
      );
  }
  next();
};

module.exports = admin;

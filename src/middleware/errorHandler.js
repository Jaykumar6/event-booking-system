export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({ message: "Email already exists" });
  }

  return res.status(500).json({ message: "Something went wrong" });
}

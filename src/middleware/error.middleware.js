export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  // Mongoose validation errors get a friendlier 400.
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  // Duplicate key (unique index) errors.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already taken` });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Something went wrong' });
}

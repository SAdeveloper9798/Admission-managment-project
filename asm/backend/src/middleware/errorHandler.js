const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { PrismaClientKnownRequestError } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error(err.message || err);

  if (err instanceof TokenExpiredError)
    return res.status(401).json({ message: 'Token expired' });

  if (err instanceof JsonWebTokenError)
    return res.status(401).json({ message: 'Invalid token' });

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002')
      return res.status(409).json({ message: 'Record already exists', field: err.meta?.target });
    if (err.code === 'P2025')
      return res.status(404).json({ message: 'Record not found' });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;

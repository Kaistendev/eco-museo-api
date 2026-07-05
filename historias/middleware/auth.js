import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'AUTH_REQUIRED', message: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'INVALID_TOKEN', message: 'Token inválido o expirado' });
    }
    req.userId = decoded.id;
    next();
  });
};

export const protectMutations = (req, res, next) => {
  const publicMethods = ['GET', 'OPTIONS'];
  if (publicMethods.includes(req.method)) {
    return next();
  }
  verifyToken(req, res, next);
};

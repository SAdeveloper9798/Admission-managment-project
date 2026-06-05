const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const login = async (req, res) => {
  const { email, password } = req.body;
  const [user] = await prisma.user.findMany({ where: { email: { equals: email } } });
  if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
};

const getProfile = async (req, res) => {
  const { password: _, ...user } = req.user;
  res.json(user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
  res.json({ message: 'Password changed successfully' });
};

module.exports = { login, getProfile, changePassword };

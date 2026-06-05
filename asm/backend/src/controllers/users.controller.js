const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { paginate, paginatedResponse } = require('../utils/pagination');

const getUsers = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);
  res.json(paginatedResponse(users, total, page, limit));
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.status(201).json(user);
};

const updateUser = async (req, res) => {
  const { name, role, isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role, isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  res.json(user);
};

const deleteUser = async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
};

module.exports = { getUsers, createUser, updateUser, deleteUser };

const prisma = require('../config/prisma');
const { paginate, paginatedResponse } = require('../utils/pagination');

// Generic CRUD factory
const crudFactory = (model, include = {}) => ({
  getAll: async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const where = req.query.search
      ? { name: { contains: req.query.search, mode: 'insensitive' } }
      : {};
    const [items, total] = await Promise.all([
      prisma[model].findMany({ where, skip, take: limit, include, orderBy: { createdAt: 'desc' } }),
      prisma[model].count({ where }),
    ]);
    res.json(paginatedResponse(items, total, page, limit));
  },
  getOne: async (req, res) => {
    const item = await prisma[model].findUniqueOrThrow({ where: { id: req.params.id }, include });
    res.json(item);
  },
  create: async (req, res) => {
    const item = await prisma[model].create({ data: req.body, include });
    res.status(201).json(item);
  },
  update: async (req, res) => {
    const item = await prisma[model].update({ where: { id: req.params.id }, data: req.body, include });
    res.json(item);
  },
  remove: async (req, res) => {
    await prisma[model].delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  },
});

// Institution
const institutionCtrl = crudFactory('institution');

// Campus
const campusCtrl = {
  ...crudFactory('campus', { institution: true }),
  getAll: async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const where = {};
    if (req.query.institutionId) where.institutionId = req.query.institutionId;
    if (req.query.search) where.name = { contains: req.query.search, mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.campus.findMany({ where, skip, take: limit, include: { institution: true }, orderBy: { createdAt: 'desc' } }),
      prisma.campus.count({ where }),
    ]);
    res.json(paginatedResponse(items, total, page, limit));
  },
};

// Department
const departmentCtrl = {
  ...crudFactory('department', { campus: { include: { institution: true } } }),
  getAll: async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const where = {};
    if (req.query.campusId) where.campusId = req.query.campusId;
    if (req.query.search) where.name = { contains: req.query.search, mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.department.findMany({ where, skip, take: limit, include: { campus: { include: { institution: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.department.count({ where }),
    ]);
    res.json(paginatedResponse(items, total, page, limit));
  },
};

// Program
const programCtrl = {
  ...crudFactory('program', { department: { include: { campus: { include: { institution: true } } } } }),
  getAll: async (req, res) => {
    const { page, limit, skip } = paginate(req.query);
    const where = {};
    if (req.query.departmentId) where.departmentId = req.query.departmentId;
    if (req.query.courseType) where.courseType = req.query.courseType;
    if (req.query.search) where.name = { contains: req.query.search, mode: 'insensitive' };
    const [items, total] = await Promise.all([
      prisma.program.findMany({ where, skip, take: limit, include: { department: { include: { campus: { include: { institution: true } } } }, seatMatrix: true }, orderBy: { createdAt: 'desc' } }),
      prisma.program.count({ where }),
    ]);
    res.json(paginatedResponse(items, total, page, limit));
  },
};

// Academic Year
const academicYearCtrl = {
  ...crudFactory('academicYear'),
  setCurrent: async (req, res) => {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    const year = await prisma.academicYear.update({
      where: { id: req.params.id },
      data: { isCurrent: true },
    });
    res.json(year);
  },
};

module.exports = { institutionCtrl, campusCtrl, departmentCtrl, programCtrl, academicYearCtrl };

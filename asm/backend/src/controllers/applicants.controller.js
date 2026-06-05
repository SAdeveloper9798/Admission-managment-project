const prisma = require('../config/prisma');
const { paginate, paginatedResponse } = require('../utils/pagination');

const getApplicants = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const where = {};

  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
      { phone: { contains: req.query.search } },
    ];
  }
  if (req.query.programId) where.programId = req.query.programId;
  if (req.query.quotaType) where.quotaType = req.query.quotaType;
  if (req.query.documentStatus) where.documentStatus = req.query.documentStatus;
  if (req.query.entryType) where.entryType = req.query.entryType;

  const [applicants, total] = await Promise.all([
    prisma.applicant.findMany({
      where,
      skip,
      take: limit,
      include: { program: { include: { department: true } }, admission: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.applicant.count({ where }),
  ]);
  res.json(paginatedResponse(applicants, total, page, limit));
};

const getApplicant = async (req, res) => {
  const applicant = await prisma.applicant.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      program: { include: { department: { include: { campus: { include: { institution: true } } } } } },
      admission: { include: { academicYear: true } },
    },
  });
  res.json(applicant);
};

const createApplicant = async (req, res) => {
  const applicant = await prisma.applicant.create({
    data: req.body,
    include: { program: true },
  });
  res.status(201).json(applicant);
};

const updateApplicant = async (req, res) => {
  const { admission, ...data } = req.body;
  const applicant = await prisma.applicant.update({
    where: { id: req.params.id },
    data,
    include: { program: true, admission: true },
  });
  res.json(applicant);
};

const updateDocumentStatus = async (req, res) => {
  const { documentStatus } = req.body;
  const applicant = await prisma.applicant.update({
    where: { id: req.params.id },
    data: { documentStatus },
  });
  res.json(applicant);
};

const deleteApplicant = async (req, res) => {
  await prisma.applicant.delete({ where: { id: req.params.id } });
  res.json({ message: 'Applicant deleted' });
};

module.exports = { getApplicants, getApplicant, createApplicant, updateApplicant, updateDocumentStatus, deleteApplicant };

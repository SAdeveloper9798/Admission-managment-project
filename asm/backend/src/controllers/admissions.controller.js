const prisma = require('../config/prisma');
const { generateAdmissionNumber } = require('../utils/admissionNumber');
const { paginate, paginatedResponse } = require('../utils/pagination');

const allocateSeat = async (req, res) => {
  const { applicantId, programId, academicYearId, quotaType, admissionMode, allotmentNumber } = req.body;

  // Check applicant not already admitted
  const existing = await prisma.admission.findUnique({ where: { applicantId } });
  if (existing) return res.status(409).json({ message: 'Applicant already has an admission record' });

  // Check seat availability with transaction lock
  const result = await prisma.$transaction(async (tx) => {
    const seat = await tx.seatMatrix.findUnique({
      where: { programId_quotaType: { programId, quotaType } },
    });

    if (!seat) throw Object.assign(new Error('Seat matrix not configured for this quota'), { status: 400 });

    const available = seat.totalSeats + seat.supernumerarySeats - seat.allocatedSeats;
    if (available <= 0) throw Object.assign(new Error('No seats available in this quota'), { status: 400 });

    // Lock seat
    await tx.seatMatrix.update({
      where: { programId_quotaType: { programId, quotaType } },
      data: { allocatedSeats: { increment: 1 } },
    });

    return tx.admission.create({
      data: { applicantId, programId, academicYearId, quotaType, admissionMode, allotmentNumber, status: 'ALLOCATED' },
      include: { applicant: true, program: true, academicYear: true },
    });
  });

  res.status(201).json(result);
};

const confirmAdmission = async (req, res) => {
  const admission = await prisma.admission.findUniqueOrThrow({ where: { id: req.params.id } });

  if (admission.admissionNumber) return res.status(409).json({ message: 'Admission already confirmed' });
  if (admission.feeStatus !== 'PAID') return res.status(400).json({ message: 'Fee must be paid before confirmation' });

  const academicYear = await prisma.academicYear.findUnique({ where: { id: admission.academicYearId } });
  const admissionNumber = await generateAdmissionNumber(admission.programId, admission.quotaType, academicYear.year);

  const updated = await prisma.admission.update({
    where: { id: req.params.id },
    data: { admissionNumber, status: 'CONFIRMED', confirmedAt: new Date() },
    include: { applicant: true, program: true, academicYear: true },
  });

  res.json(updated);
};

const updateFeeStatus = async (req, res) => {
  const { feeStatus } = req.body;
  const admission = await prisma.admission.update({
    where: { id: req.params.id },
    data: { feeStatus },
    include: { applicant: true },
  });
  res.json(admission);
};

const cancelAdmission = async (req, res) => {
  const admission = await prisma.admission.findUniqueOrThrow({ where: { id: req.params.id } });
  if (admission.status === 'CONFIRMED') return res.status(400).json({ message: 'Cannot cancel a confirmed admission' });

  await prisma.$transaction([
    prisma.seatMatrix.update({
      where: { programId_quotaType: { programId: admission.programId, quotaType: admission.quotaType } },
      data: { allocatedSeats: { decrement: 1 } },
    }),
    prisma.admission.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } }),
  ]);

  res.json({ message: 'Admission cancelled and seat released' });
};

const getAdmissions = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.programId) where.programId = req.query.programId;
  if (req.query.quotaType) where.quotaType = req.query.quotaType;
  if (req.query.academicYearId) where.academicYearId = req.query.academicYearId;
  if (req.query.feeStatus) where.feeStatus = req.query.feeStatus;
  if (req.query.search) {
    where.OR = [
      { admissionNumber: { contains: req.query.search, mode: 'insensitive' } },
      { applicant: { name: { contains: req.query.search, mode: 'insensitive' } } },
    ];
  }

  const [admissions, total] = await Promise.all([
    prisma.admission.findMany({
      where,
      skip,
      take: limit,
      include: { applicant: true, program: { include: { department: true } }, academicYear: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.admission.count({ where }),
  ]);
  res.json(paginatedResponse(admissions, total, page, limit));
};

const getAdmission = async (req, res) => {
  const admission = await prisma.admission.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      applicant: true,
      program: { include: { department: { include: { campus: { include: { institution: true } } } } } },
      academicYear: true,
    },
  });
  res.json(admission);
};

module.exports = { allocateSeat, confirmAdmission, updateFeeStatus, cancelAdmission, getAdmissions, getAdmission };

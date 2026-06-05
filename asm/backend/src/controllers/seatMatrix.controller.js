const prisma = require('../config/prisma');

const getSeatMatrix = async (req, res) => {
  const { programId } = req.params;
  const matrix = await prisma.seatMatrix.findMany({
    where: { programId },
    include: { program: true },
  });
  const program = await prisma.program.findUniqueOrThrow({ where: { id: programId } });
  const totalAllocated = matrix.reduce((s, m) => s + m.totalSeats, 0);
  res.json({ program, matrix, totalAllocated, remainingIntake: program.totalIntake - totalAllocated });
};

const upsertSeatMatrix = async (req, res) => {
  const { programId } = req.params;
  const { quotas } = req.body; // [{ quotaType, totalSeats, supernumerarySeats }]

  const program = await prisma.program.findUniqueOrThrow({ where: { id: programId } });
  const totalRequested = quotas.reduce((s, q) => s + q.totalSeats, 0);

  if (totalRequested > program.totalIntake)
    return res.status(400).json({ message: `Total quota seats (${totalRequested}) cannot exceed intake (${program.totalIntake})` });

  const results = await prisma.$transaction(
    quotas.map((q) =>
      prisma.seatMatrix.upsert({
        where: { programId_quotaType: { programId, quotaType: q.quotaType } },
        create: { programId, quotaType: q.quotaType, totalSeats: q.totalSeats, supernumerarySeats: q.supernumerarySeats || 0 },
        update: {
          totalSeats: q.totalSeats,
          supernumerarySeats: q.supernumerarySeats || 0,
        },
      })
    )
  );

  res.json(results);
};

const getAllSeatMatrix = async (req, res) => {
  const matrix = await prisma.seatMatrix.findMany({
    include: { program: { include: { department: { include: { campus: true } } } } },
    orderBy: { program: { name: 'asc' } },
  });
  res.json(matrix);
};

module.exports = { getSeatMatrix, upsertSeatMatrix, getAllSeatMatrix };

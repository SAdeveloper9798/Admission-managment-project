const prisma = require('../config/prisma');

const getDashboardStats = async (req, res) => {
  const { academicYearId } = req.query;

  const admissionWhere = academicYearId ? { academicYearId } : {};

  const [
    totalIntake,
    totalAdmitted,
    pendingDocs,
    pendingFees,
    seatMatrix,
    quotaStats,
    programStats,
    monthlyTrend,
    seatByProgram,
  ] = await Promise.all([
    prisma.program.aggregate({ _sum: { totalIntake: true } }),
    prisma.admission.count({ where: { ...admissionWhere, status: { in: ['ALLOCATED', 'CONFIRMED'] } } }),
    prisma.applicant.count({ where: { documentStatus: 'PENDING' } }),
    prisma.admission.count({ where: { ...admissionWhere, feeStatus: 'PENDING', status: { in: ['ALLOCATED', 'CONFIRMED'] } } }),
    prisma.seatMatrix.aggregate({ _sum: { totalSeats: true, allocatedSeats: true } }),
    prisma.admission.groupBy({
      by: ['quotaType'],
      where: admissionWhere,
      _count: { id: true },
    }),
    prisma.admission.groupBy({
      by: ['programId'],
      where: admissionWhere,
      _count: { id: true },
    }),
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
      FROM "Admission"
      WHERE status IN ('ALLOCATED', 'CONFIRMED')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `,
    prisma.seatMatrix.findMany({
      include: { program: { select: { id: true, name: true, code: true } } },
    }),
  ]);

  // Enrich program stats
  const programIds = programStats.map((p) => p.programId);
  const programs = await prisma.program.findMany({ where: { id: { in: programIds } }, select: { id: true, name: true, code: true } });
  const programMap = Object.fromEntries(programs.map((p) => [p.id, p]));

  // Seat by program grouped
  const seatByProgramMap = {};
  for (const s of seatByProgram) {
    const key = s.program.code;
    if (!seatByProgramMap[key]) seatByProgramMap[key] = { program: s.program.name, code: s.program.code, totalSeats: 0, allocatedSeats: 0 };
    seatByProgramMap[key].totalSeats += s.totalSeats;
    seatByProgramMap[key].allocatedSeats += s.allocatedSeats;
  }
  const seatStats = Object.values(seatByProgramMap).map(s => ({
    ...s,
    remaining: s.totalSeats - s.allocatedSeats,
  }));

  res.json({
    cards: {
      totalIntake: totalIntake._sum.totalIntake || 0,
      totalAdmitted,
      remainingSeats: (seatMatrix._sum.totalSeats || 0) - (seatMatrix._sum.allocatedSeats || 0),
      pendingDocs,
      pendingFees,
    },
    quotaStats: quotaStats.map((q) => ({ quota: q.quotaType, count: q._count.id })),
    programStats: programStats.map((p) => ({
      program: programMap[p.programId]?.name || p.programId,
      code: programMap[p.programId]?.code,
      count: p._count.id,
    })),
    seatStats,
    monthlyTrend: monthlyTrend.map((m) => ({
      month: new Date(m.month).toLocaleString('default', { month: 'short', year: 'numeric' }),
      count: Number(m.count),
    })),
  });
};

module.exports = { getDashboardStats };

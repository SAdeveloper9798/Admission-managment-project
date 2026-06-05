const prisma = require('../config/prisma');

const generateAdmissionNumber = async (programId, quotaType, academicYear) => {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { department: { include: { campus: { include: { institution: true } } } } },
  });

  const instCode = program.department.campus.institution.code.toUpperCase();
  const year = academicYear.split('-')[0];
  const courseType = program.courseType;
  const progCode = program.code.toUpperCase();
  const quota = quotaType.toUpperCase();

  const count = await prisma.admission.count({
    where: {
      programId,
      quotaType,
      academicYear: { year: academicYear },
      admissionNumber: { not: null },
    },
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${instCode}/${year}/${courseType}/${progCode}/${quota}/${seq}`;
};

module.exports = { generateAdmissionNumber };

const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function main() {
  console.log('Seeding database...');

  // Users
  const adminPass = await bcrypt.hash('admin123', 10);
  const officerPass = await bcrypt.hash('officer123', 10);
  const mgmtPass = await bcrypt.hash('mgmt123', 10);

  await prisma.user.upsert({ where: { email: 'admin@admission.com' }, update: {}, create: { name: 'Super Admin', email: 'admin@admission.com', password: adminPass, role: 'ADMIN' } });
  await prisma.user.upsert({ where: { email: 'officer@admission.com' }, update: {}, create: { name: 'John Officer', email: 'officer@admission.com', password: officerPass, role: 'ADMISSION_OFFICER' } });
  await prisma.user.upsert({ where: { email: 'mgmt@admission.com' }, update: {}, create: { name: 'Management User', email: 'mgmt@admission.com', password: mgmtPass, role: 'MANAGEMENT' } });

  // Institution
  const inst = await prisma.institution.upsert({ where: { code: 'RVCE' }, update: {}, create: { name: 'RV College of Engineering', code: 'RVCE', address: 'Mysore Road, Bangalore', phone: '0806717800', email: 'info@rvce.edu.in' } });

  // Campus
  const campus = await prisma.campus.upsert({ where: { code_institutionId: { code: 'MAIN', institutionId: inst.id } }, update: {}, create: { name: 'Main Campus', code: 'MAIN', institutionId: inst.id } });

  // Departments
  const dept = await prisma.department.upsert({ where: { code_campusId: { code: 'CSE', campusId: campus.id } }, update: {}, create: { name: 'Computer Science & Engineering', code: 'CSE', campusId: campus.id } });
  const deptECE = await prisma.department.upsert({ where: { code_campusId: { code: 'ECE', campusId: campus.id } }, update: {}, create: { name: 'Electronics & Communication', code: 'ECE', campusId: campus.id } });
  const deptME = await prisma.department.upsert({ where: { code_campusId: { code: 'ME', campusId: campus.id } }, update: {}, create: { name: 'Mechanical Engineering', code: 'ME', campusId: campus.id } });

  // Programs
  const progCSE = await prisma.program.upsert({ where: { code_departmentId: { code: 'BECS', departmentId: dept.id } }, update: {}, create: { name: 'B.E Computer Science', code: 'BECS', courseType: 'UG', entryType: 'REGULAR', departmentId: dept.id, totalIntake: 120 } });
  const progECE = await prisma.program.upsert({ where: { code_departmentId: { code: 'BEECE', departmentId: deptECE.id } }, update: {}, create: { name: 'B.E Electronics & Communication', code: 'BEECE', courseType: 'UG', entryType: 'REGULAR', departmentId: deptECE.id, totalIntake: 60 } });
  const progME = await prisma.program.upsert({ where: { code_departmentId: { code: 'BEME', departmentId: deptME.id } }, update: {}, create: { name: 'B.E Mechanical Engineering', code: 'BEME', courseType: 'UG', entryType: 'REGULAR', departmentId: deptME.id, totalIntake: 60 } });

  // Academic Year
  const ay = await prisma.academicYear.upsert({ where: { year: '2025-26' }, update: {}, create: { year: '2025-26', isActive: true, isCurrent: true } });

  // Seat Matrix
  const seatData = [
    { programId: progCSE.id, quotaType: 'KCET', totalSeats: 60 },
    { programId: progCSE.id, quotaType: 'COMEDK', totalSeats: 30 },
    { programId: progCSE.id, quotaType: 'MANAGEMENT', totalSeats: 30 },
    { programId: progECE.id, quotaType: 'KCET', totalSeats: 30 },
    { programId: progECE.id, quotaType: 'MANAGEMENT', totalSeats: 30 },
    { programId: progME.id, quotaType: 'KCET', totalSeats: 30 },
    { programId: progME.id, quotaType: 'COMEDK', totalSeats: 30 },
  ];
  for (const s of seatData) {
    await prisma.seatMatrix.upsert({ where: { programId_quotaType: { programId: s.programId, quotaType: s.quotaType } }, update: {}, create: s });
  }

  // 20 Applicants
  const applicantsData = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '9876543210', gender: 'MALE', dob: new Date('2003-05-12'), address: 'Bangalore', category: 'General', entryType: 'REGULAR', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 92, yearOfPassing: 2024, parentName: 'Suresh Sharma', parentPhone: '9876543200' },
    { name: 'Priya Nair', email: 'priya.nair@email.com', phone: '9876543211', gender: 'FEMALE', dob: new Date('2003-08-20'), address: 'Mysore', category: 'OBC', entryType: 'REGULAR', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 88, yearOfPassing: 2024, parentName: 'Rajan Nair', parentPhone: '9876543201' },
    { name: 'Arjun Reddy', email: 'arjun.reddy@email.com', phone: '9876543212', gender: 'MALE', dob: new Date('2003-02-15'), address: 'Hyderabad', category: 'General', entryType: 'REGULAR', quotaType: 'COMEDK', programId: progCSE.id, qualifyingExam: 'COMEDK', marks: 85, yearOfPassing: 2024, parentName: 'Venkat Reddy', parentPhone: '9876543202' },
    { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@email.com', phone: '9876543213', gender: 'FEMALE', dob: new Date('2003-11-30'), address: 'Pune', category: 'SC', entryType: 'REGULAR', quotaType: 'KCET', programId: progECE.id, qualifyingExam: 'KCET', marks: 79, yearOfPassing: 2024, parentName: 'Mohan Kulkarni', parentPhone: '9876543203' },
    { name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '9876543214', gender: 'MALE', dob: new Date('2002-07-04'), address: 'Delhi', category: 'General', entryType: 'REGULAR', quotaType: 'MANAGEMENT', programId: progCSE.id, qualifyingExam: 'JEE', marks: 76, yearOfPassing: 2024, parentName: 'Rajesh Singh', parentPhone: '9876543204' },
    { name: 'Ananya Iyer', email: 'ananya.iyer@email.com', phone: '9876543215', gender: 'FEMALE', dob: new Date('2003-03-22'), address: 'Chennai', category: 'OBC', entryType: 'REGULAR', quotaType: 'KCET', programId: progME.id, qualifyingExam: 'KCET', marks: 82, yearOfPassing: 2024, parentName: 'Suresh Iyer', parentPhone: '9876543205' },
    { name: 'Karthik Menon', email: 'karthik.menon@email.com', phone: '9876543216', gender: 'MALE', dob: new Date('2003-09-10'), address: 'Kochi', category: 'General', entryType: 'REGULAR', quotaType: 'COMEDK', programId: progECE.id, qualifyingExam: 'COMEDK', marks: 80, yearOfPassing: 2024, parentName: 'Ravi Menon', parentPhone: '9876543206' },
    { name: 'Divya Patel', email: 'divya.patel@email.com', phone: '9876543217', gender: 'FEMALE', dob: new Date('2003-01-18'), address: 'Ahmedabad', category: 'General', entryType: 'REGULAR', quotaType: 'MANAGEMENT', programId: progME.id, qualifyingExam: 'JEE', marks: 74, yearOfPassing: 2024, parentName: 'Nilesh Patel', parentPhone: '9876543207' },
    { name: 'Rohan Desai', email: 'rohan.desai@email.com', phone: '9876543218', gender: 'MALE', dob: new Date('2002-12-05'), address: 'Mumbai', category: 'ST', entryType: 'REGULAR', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 86, yearOfPassing: 2024, parentName: 'Anil Desai', parentPhone: '9876543208' },
    { name: 'Meera Krishnan', email: 'meera.krishnan@email.com', phone: '9876543219', gender: 'FEMALE', dob: new Date('2003-06-14'), address: 'Trivandrum', category: 'OBC', entryType: 'REGULAR', quotaType: 'KCET', programId: progECE.id, qualifyingExam: 'KCET', marks: 91, yearOfPassing: 2024, parentName: 'Gopalan Krishnan', parentPhone: '9876543209' },
    { name: 'Aditya Kumar', email: 'aditya.kumar@email.com', phone: '9876543220', gender: 'MALE', dob: new Date('2003-04-28'), address: 'Patna', category: 'General', entryType: 'LATERAL', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 78, yearOfPassing: 2024, parentName: 'Sunil Kumar', parentPhone: '9876543210' },
    { name: 'Pooja Hegde', email: 'pooja.hegde@email.com', phone: '9876543221', gender: 'FEMALE', dob: new Date('2003-10-07'), address: 'Mangalore', category: 'General', entryType: 'REGULAR', quotaType: 'COMEDK', programId: progCSE.id, qualifyingExam: 'COMEDK', marks: 83, yearOfPassing: 2024, parentName: 'Ramesh Hegde', parentPhone: '9876543211' },
    { name: 'Suresh Babu', email: 'suresh.babu@email.com', phone: '9876543222', gender: 'MALE', dob: new Date('2002-08-16'), address: 'Coimbatore', category: 'SC', entryType: 'REGULAR', quotaType: 'KCET', programId: progME.id, qualifyingExam: 'KCET', marks: 77, yearOfPassing: 2024, parentName: 'Babu Rao', parentPhone: '9876543212' },
    { name: 'Lakshmi Devi', email: 'lakshmi.devi@email.com', phone: '9876543223', gender: 'FEMALE', dob: new Date('2003-07-23'), address: 'Vizag', category: 'OBC', entryType: 'REGULAR', quotaType: 'MANAGEMENT', programId: progECE.id, qualifyingExam: 'JEE', marks: 72, yearOfPassing: 2024, parentName: 'Venkata Rao', parentPhone: '9876543213' },
    { name: 'Nikhil Joshi', email: 'nikhil.joshi@email.com', phone: '9876543224', gender: 'MALE', dob: new Date('2003-02-09'), address: 'Nagpur', category: 'General', entryType: 'REGULAR', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 89, yearOfPassing: 2024, parentName: 'Prakash Joshi', parentPhone: '9876543214' },
    { name: 'Kavitha Rao', email: 'kavitha.rao@email.com', phone: '9876543225', gender: 'FEMALE', dob: new Date('2003-05-31'), address: 'Hubli', category: 'General', entryType: 'REGULAR', quotaType: 'KCET', programId: progME.id, qualifyingExam: 'KCET', marks: 81, yearOfPassing: 2024, parentName: 'Shiva Rao', parentPhone: '9876543215' },
    { name: 'Deepak Nair', email: 'deepak.nair@email.com', phone: '9876543226', gender: 'MALE', dob: new Date('2002-11-19'), address: 'Calicut', category: 'OBC', entryType: 'REGULAR', quotaType: 'COMEDK', programId: progME.id, qualifyingExam: 'COMEDK', marks: 75, yearOfPassing: 2024, parentName: 'Mohan Nair', parentPhone: '9876543216' },
    { name: 'Swathi Gowda', email: 'swathi.gowda@email.com', phone: '9876543227', gender: 'FEMALE', dob: new Date('2003-08-03'), address: 'Shimoga', category: 'SC', entryType: 'REGULAR', quotaType: 'KCET', programId: progCSE.id, qualifyingExam: 'KCET', marks: 87, yearOfPassing: 2024, parentName: 'Ramu Gowda', parentPhone: '9876543217' },
    { name: 'Harish Verma', email: 'harish.verma@email.com', phone: '9876543228', gender: 'MALE', dob: new Date('2003-03-14'), address: 'Jaipur', category: 'General', entryType: 'REGULAR', quotaType: 'MANAGEMENT', programId: progCSE.id, qualifyingExam: 'JEE', marks: 73, yearOfPassing: 2024, parentName: 'Ramesh Verma', parentPhone: '9876543218' },
    { name: 'Bhavana Shetty', email: 'bhavana.shetty@email.com', phone: '9876543229', gender: 'FEMALE', dob: new Date('2003-12-25'), address: 'Udupi', category: 'General', entryType: 'REGULAR', quotaType: 'KCET', programId: progECE.id, qualifyingExam: 'KCET', marks: 90, yearOfPassing: 2024, parentName: 'Dinesh Shetty', parentPhone: '9876543219' },
  ];

  const createdApplicants = [];
  for (const a of applicantsData) {
    const existing = await prisma.applicant.findFirst({ where: { email: a.email } });
    if (!existing) {
      const created = await prisma.applicant.create({ data: a });
      createdApplicants.push(created);
    } else {
      createdApplicants.push(existing);
    }
  }

  // Allocate seats for first 12 applicants and update seat matrix
  const admissionConfigs = [
    { idx: 0, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 1, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 2, quotaType: 'COMEDK', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 3, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progECE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 4, quotaType: 'MANAGEMENT', admissionMode: 'MANAGEMENT', programId: progCSE.id, feeStatus: 'PENDING', status: 'ALLOCATED' },
    { idx: 5, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progME.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 6, quotaType: 'COMEDK', admissionMode: 'GOVERNMENT', programId: progECE.id, feeStatus: 'PENDING', status: 'ALLOCATED' },
    { idx: 7, quotaType: 'MANAGEMENT', admissionMode: 'MANAGEMENT', programId: progME.id, feeStatus: 'PENDING', status: 'ALLOCATED' },
    { idx: 8, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 9, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progECE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 14, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PAID', status: 'CONFIRMED' },
    { idx: 17, quotaType: 'KCET', admissionMode: 'GOVERNMENT', programId: progCSE.id, feeStatus: 'PENDING', status: 'ALLOCATED' },
  ];

  for (const cfg of admissionConfigs) {
    const applicant = createdApplicants[cfg.idx];
    if (!applicant) continue;
    const existing = await prisma.admission.findUnique({ where: { applicantId: applicant.id } });
    if (!existing) {
      await prisma.admission.create({
        data: {
          applicantId: applicant.id,
          programId: cfg.programId,
          academicYearId: ay.id,
          quotaType: cfg.quotaType,
          admissionMode: cfg.admissionMode,
          status: cfg.status,
          feeStatus: cfg.feeStatus,
          admissionNumber: cfg.status === 'CONFIRMED' ? `ADM-2025-${String(cfg.idx + 1).padStart(4, '0')}` : null,
          confirmedAt: cfg.status === 'CONFIRMED' ? new Date() : null,
        },
      });
      await prisma.seatMatrix.updateMany({
        where: { programId: cfg.programId, quotaType: cfg.quotaType },
        data: { allocatedSeats: { increment: 1 } },
      });
    }
  }

  // Update doc status for some applicants
  await prisma.applicant.updateMany({ where: { email: { in: ['rahul.sharma@email.com', 'priya.nair@email.com', 'arjun.reddy@email.com', 'sneha.kulkarni@email.com'] } }, data: { documentStatus: 'VERIFIED' } });
  await prisma.applicant.updateMany({ where: { email: { in: ['vikram.singh@email.com', 'ananya.iyer@email.com', 'karthik.menon@email.com'] } }, data: { documentStatus: 'SUBMITTED' } });

  console.log('✅ Seed complete!');
  console.log('Admin: admin@admission.com / admin123');
  console.log('Officer: officer@admission.com / officer123');
  console.log('Management: mgmt@admission.com / mgmt123');
}

main().catch(console.error).finally(() => prisma.$disconnect());

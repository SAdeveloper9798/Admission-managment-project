const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/institutions', require('./master.routes').institutionRouter);
router.use('/campuses', require('./master.routes').campusRouter);
router.use('/departments', require('./master.routes').departmentRouter);
router.use('/programs', require('./master.routes').programRouter);
router.use('/academic-years', require('./master.routes').academicYearRouter);
router.use('/seat-matrix', require('./seatMatrix.routes'));
router.use('/applicants', require('./applicants.routes'));
router.use('/admissions', require('./admissions.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;

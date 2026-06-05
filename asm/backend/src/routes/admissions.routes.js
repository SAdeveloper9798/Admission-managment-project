const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  allocateSeat, confirmAdmission, updateFeeStatus, cancelAdmission, getAdmissions, getAdmission,
} = require('../controllers/admissions.controller');

router.use(authenticate);

router.get('/', getAdmissions);
router.get('/:id', getAdmission);
router.post('/allocate',
  authorize('ADMIN', 'ADMISSION_OFFICER'),
  [
    body('applicantId').notEmpty(),
    body('programId').notEmpty(),
    body('academicYearId').notEmpty(),
    body('quotaType').isIn(['KCET', 'COMEDK', 'MANAGEMENT', 'SNQ']),
    body('admissionMode').isIn(['GOVERNMENT', 'MANAGEMENT']),
  ],
  validate,
  allocateSeat
);
router.patch('/:id/confirm', authorize('ADMIN', 'ADMISSION_OFFICER'), confirmAdmission);
router.patch('/:id/fee-status',
  authorize('ADMIN', 'ADMISSION_OFFICER'),
  [body('feeStatus').isIn(['PENDING', 'PAID'])],
  validate,
  updateFeeStatus
);
router.patch('/:id/cancel', authorize('ADMIN'), cancelAdmission);

module.exports = router;

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getApplicants, getApplicant, createApplicant, updateApplicant, updateDocumentStatus, deleteApplicant,
} = require('../controllers/applicants.controller');

router.use(authenticate);

const applicantValidation = [
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']),
  body('dob').isISO8601(),
  body('address').notEmpty(),
  body('category').notEmpty(),
  body('entryType').isIn(['REGULAR', 'LATERAL']),
  body('quotaType').isIn(['KCET', 'COMEDK', 'MANAGEMENT', 'SNQ']),
  body('programId').notEmpty(),
  body('qualifyingExam').notEmpty(),
  body('marks').isFloat({ min: 0, max: 100 }),
  body('yearOfPassing').isInt({ min: 2000 }),
  body('parentName').notEmpty(),
  body('parentPhone').notEmpty(),
];

router.get('/', getApplicants);
router.get('/:id', getApplicant);
router.post('/', authorize('ADMIN', 'ADMISSION_OFFICER'), applicantValidation, validate, createApplicant);
router.put('/:id', authorize('ADMIN', 'ADMISSION_OFFICER'), updateApplicant);
router.patch('/:id/document-status', authorize('ADMIN', 'ADMISSION_OFFICER'), updateDocumentStatus);
router.delete('/:id', authorize('ADMIN'), deleteApplicant);

module.exports = router;

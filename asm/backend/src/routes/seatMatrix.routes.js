const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSeatMatrix, upsertSeatMatrix, getAllSeatMatrix } = require('../controllers/seatMatrix.controller');

router.use(authenticate);
router.get('/', getAllSeatMatrix);
router.get('/:programId', getSeatMatrix);
router.post('/:programId', authorize('ADMIN', 'ADMISSION_OFFICER'), upsertSeatMatrix);

module.exports = router;

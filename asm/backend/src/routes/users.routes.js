const router = require('express').Router();
const { body } = require('express-validator');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/users.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));

router.get('/', getUsers);
router.post('/',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role').isIn(['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT'])],
  validate,
  createUser
);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

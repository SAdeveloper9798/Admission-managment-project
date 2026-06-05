const router = require('express').Router();
const { body } = require('express-validator');
const { login, getProfile, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);
router.get('/profile', authenticate, getProfile);
router.put('/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  changePassword
);

module.exports = router;

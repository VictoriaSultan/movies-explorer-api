const router = require('express').Router();
const {
  updateProfile,
  getCurrentUser,
} = require('../controllers/users');
const {
  validateUpdateProfile,
} = require('../middlewares/validators');

router.get('/me', getCurrentUser);
router.patch('/me', validateUpdateProfile, updateProfile);

module.exports = router;

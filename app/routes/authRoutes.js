const express = require('express');
const { registerValidationSchema, loginValidationSchema } = require('../rules/authRules');
const AuthController = require('../controller/AuthController');
const { adminRoleWare } = require('../middleware/roleWare');
const jwtAuth = require('../middleware/jwtAuth');
const router = express.Router();

// Register route with validation
router.post('/register', registerValidationSchema, AuthController.register);
// Add other authentication routes as needed
router.post('/login', loginValidationSchema, AuthController.login); // Example login route
// router.post('/logout', AuthController.logout); // Example logout route
router.get('/users/all', jwtAuth, adminRoleWare, AuthController.getUserList); // Example profile route

// Export the router
module.exports = router;
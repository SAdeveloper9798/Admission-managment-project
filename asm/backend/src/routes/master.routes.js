const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  institutionCtrl, campusCtrl, departmentCtrl, programCtrl, academicYearCtrl,
} = require('../controllers/master.controller');

const adminOrOfficer = [authenticate, authorize('ADMIN', 'ADMISSION_OFFICER')];
const allRoles = [authenticate];
const adminOnly = [authenticate, authorize('ADMIN')];

// Institution
const institutionRouter = express.Router();
institutionRouter.get('/', allRoles, institutionCtrl.getAll);
institutionRouter.get('/:id', allRoles, institutionCtrl.getOne);
institutionRouter.post('/', adminOrOfficer, institutionCtrl.create);
institutionRouter.put('/:id', adminOrOfficer, institutionCtrl.update);
institutionRouter.delete('/:id', adminOnly, institutionCtrl.remove);

// Campus
const campusRouter = express.Router();
campusRouter.get('/', allRoles, campusCtrl.getAll);
campusRouter.get('/:id', allRoles, campusCtrl.getOne);
campusRouter.post('/', adminOrOfficer, campusCtrl.create);
campusRouter.put('/:id', adminOrOfficer, campusCtrl.update);
campusRouter.delete('/:id', adminOnly, campusCtrl.remove);

// Department
const departmentRouter = express.Router();
departmentRouter.get('/', allRoles, departmentCtrl.getAll);
departmentRouter.get('/:id', allRoles, departmentCtrl.getOne);
departmentRouter.post('/', adminOrOfficer, departmentCtrl.create);
departmentRouter.put('/:id', adminOrOfficer, departmentCtrl.update);
departmentRouter.delete('/:id', adminOnly, departmentCtrl.remove);

// Program
const programRouter = express.Router();
programRouter.get('/', allRoles, programCtrl.getAll);
programRouter.get('/:id', allRoles, programCtrl.getOne);
programRouter.post('/', adminOrOfficer, programCtrl.create);
programRouter.put('/:id', adminOrOfficer, programCtrl.update);
programRouter.delete('/:id', adminOnly, programCtrl.remove);

// Academic Year
const academicYearRouter = express.Router();
academicYearRouter.get('/', allRoles, academicYearCtrl.getAll);
academicYearRouter.get('/:id', allRoles, academicYearCtrl.getOne);
academicYearRouter.post('/', adminOrOfficer, academicYearCtrl.create);
academicYearRouter.put('/:id', adminOrOfficer, academicYearCtrl.update);
academicYearRouter.patch('/:id/set-current', adminOrOfficer, academicYearCtrl.setCurrent);
academicYearRouter.delete('/:id', adminOnly, academicYearCtrl.remove);

module.exports = { institutionRouter, campusRouter, departmentRouter, programRouter, academicYearRouter };

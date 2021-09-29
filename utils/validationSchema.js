const yup = require('yup');

const registerStudentSchema = yup.object({
  name: yup
    .string()
    .matches(/^[A-Za-z ]*$/, 'Please enter valid name')
    .max(40)
    .required('Name is required'),

  id: yup
    .string()
    .required('Matric is required')
    .matches(/\d{8}\/(1|2)/, 'Please Enter a valid matric e.g. 12345678/9'),

  title: yup.string().max(150).required('Title is required').trim(),

  department: yup.string().required('Department is required'),

  supervisor: yup.string().required('Supervisor is required'),

  phone: yup
    .string()
    .required()
    .matches(
      /(^(\+?6?01)[0-46-9]-*[0-9]{7,8}$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$)/,
      'Phone not valid'
    ),
  fyp: yup.string().required(),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),

  password: yup
    .string()
    .required('Password is a required field')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
    ),

  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const registerCoordinatorSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .matches(/^[A-Za-z ]*$/, 'Please enter valid name'),

  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),

  department: yup.string().required('Department is required'),

  password: yup
    .string()
    .required()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
    ),

  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const loginStudentSchema = yup.object({
  email: yup.string().required('Email or matric is required'),

  password: yup.string().required(`Password can't be empty`),
});

const assignPanelSchema = yup.object({
  panel1: yup.string().required(),
  panel2: yup
    .string()
    .required()
    .notOneOf([yup.ref('panel1')], `Panel 1 and 2 can't be the same`),
  title: yup.string().required(),
});

const loginLecturerSchema = yup.object({
  email: yup.string().required('Email is required'),

  password: yup.string().required(`Password can't be empty`),
});

const passwordChangeSchema = yup.object({
  password: yup
    .string()
    .required()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
    ),

  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const linkSchema = yup.object({
  driveLink: yup.string().url('Drive Must be a valid URL'),
  meetingLink: yup.string().url('Meeting Must be a valid URL'),
});

const slotSchema = yup.object({
  slotDate: yup.string().required('Date is required'),
  startTime: yup.string().required(),
  endTime: yup.string().required(),
  student: yup.string().required(),
  venue: yup.string().required(),
  type: yup.string().required(),
});

const updateSlotSchema = yup.object({
  slotDate: yup.string().required('Date is required'),
  startTime: yup.string().required(),
  endTime: yup.string().required(),
  venue: yup.string().required(),
});

const timetableSchema = yup.object({
  dates: yup.string().required('Please choose at least one date'),
  startTimeTimeTable: yup.string().required('Start time is required'),
  endTimeTimeTable: yup.string().required('End time is required'),
  duration: yup
    .number('Duration must be a number')
    .min(10)
    .required('Duration is required'),
  students: yup.lazy((val) =>
    Array.isArray(val) ? yup.array().required() : yup.string().required()
  ),
  venues: yup.lazy((val) =>
    Array.isArray(val) ? yup.array().required() : yup.string().required()
  ),
  type: yup.string().required('Type is required'),
});

const updatePasswordSchema = yup.object({
  passwordCurrent: yup
    .string()
    .required('Current Password is required')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
      'Incorrect Password fromat'
    ),
  password: yup
    .string()
    .required('New Password is required')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/,
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character'
    ),

  password2: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const updateEmaildSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

const updateStudentProfileSchema = yup.object({
  name: yup
    .string('Name must be a string')
    .matches(/^[A-Za-z ]*$/, 'Please enter valid name')
    .max(40)
    .required('Name is required'),
  phone: yup
    .string()
    .required()
    .matches(
      /(^(\+?6?01)[0-46-9]-*[0-9]{7,8}$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$)/,
      'Phone not valid'
    ),
});

const updateCoordinatorProfileSchema = yup.object({
  name: yup
    .string('Name must be a string')
    .matches(/^[A-Za-z ]*$/, 'Please enter valid name')
    .max(40)
    .required('Name is required'),
});

const updateLecturerProfileSchema = yup.object({
  name: yup
    .string('Name must be a string')
    .matches(/^[A-Za-z ]*$/, 'Please enter valid name')
    .max(40)
    .required('Name is required'),
});

const feedback1Sechma = yup.object({
  objectives: yup.string().required('Objectives is required'),
  problem_statement: yup.string().required('Problem Statement is required'),
  literature_review: yup.string().required('Literature Review is required'),
  methodology: yup
    .string()
    .required('Methodology/Technique/Approach is required'),
  requirements: yup
    .string()
    .required('Requirements (Project/Module) is required'),
  analysis_design: yup.string().required('Analysis & Design is required'),
  technical: yup
    .string()
    .required('Technical Implementation/Mastery of Tools is required'),
  stakeholder: yup
    .string()
    .required('Stakeholder Collaboration Initiative is required'),
  p_skills: yup.string().required('Presentation Skills is required'),
  overall: yup.string().required('Overall Presentation is required'),
});

const feedback2Sechma = yup.object({
  fulfillment_of_objectives: yup
    .string()
    .required('Fulfillment of Objectives is required'),
  fulfillment_of_requirements_specifications: yup
    .string()
    .required('Fulfillment of Requirements/Specifications is required'),
  design_and_technical_implementation: yup
    .string()
    .required('Design and Technical Implementation is required'),
  ui_ux: yup.string().required('UI/UX is required'),
  error_free_and_error_handling: yup
    .string()
    .required('Error-free and Error Handling is required'),
  system_complexity: yup.string().required('System Complexity is required'),
  testing_techniques: yup.string().required('Testing Techniques is required'),
  stakeholder: yup
    .string()
    .required('Collaboration with Stakeholder is required'),
  p_skills: yup.string().required('Presentation Skills is required'),
  overall: yup.string().required('Overall Presentation is required'),
});

module.exports = {
  registerStudentSchema,
  registerCoordinatorSchema,
  passwordChangeSchema,
  loginStudentSchema,
  loginLecturerSchema,
  slotSchema,
  timetableSchema,
  linkSchema,
  assignPanelSchema,
  updateSlotSchema,
  updatePasswordSchema,
  updateEmaildSchema,
  updateStudentProfileSchema,
  updateLecturerProfileSchema,
  updateCoordinatorProfileSchema,
  feedback1Sechma,
  feedback2Sechma,
};

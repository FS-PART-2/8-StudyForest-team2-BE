// Description: 사용자 입력 유효성 검사를 위한 미들웨어

// // src/api/checkValidation.js (추가)
// const { body } = require('express-validator');
//
// const validateRegister = [
//   body('email')
//     .isEmail()
//     .withMessage('유효한 이메일 주소를 입력해주세요.')
//     .normalizeEmail(),
//   body('password')
//     .isLength({ min: 8 })
//     .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     .withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'),
//   body('name')
//     .trim()
//     .isLength({ min: 2, max: 50 })
//     .withMessage('이름은 2-50자 사이여야 합니다.')
// ];
//
// const validateLogin = [
//   body('email')
//     .isEmail()
//     .withMessage('유효한 이메일 주소를 입력해주세요.')
//     .normalizeEmail(),
//   body('password')
//     .notEmpty()
//     .withMessage('비밀번호를 입력해주세요.')
// ];
//
// module.exports = {
//   validateRegister,
//   validateLogin
// };

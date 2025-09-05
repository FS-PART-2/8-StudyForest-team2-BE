// src/api/checkValidation.js
import { body } from 'express-validator';

export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2~50자여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('이름은 영문/숫자/언더바만 허용됩니다.'),
  body('nick')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('닉네임은 2~50자여야 합니다.')
    .matches(/^[\p{L}\p{N}_\s]+$/u)
    .withMessage('닉네임은 글자/숫자/언더바/공백만 허용됩니다.'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.'),
];

export const validateUpdateMe = [
  body('nick')
    .optional()
    .isString()
    .isLength({ min: 1, max: 30 })
    .withMessage('nick은 1~30자여야 합니다.'),

  body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage('username은 3~20자여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('username은 영문/숫자/_ 만 사용할 수 있습니다.'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),

  body('currentPassword')
    .optional()
    .isString()
    .isLength({ min: 8, max: 16 })
    .withMessage('currentPassword는 8~16자여야 합니다.')
    .custom((_, { req }) => {
      if (req.body.currentPassword && !req.body.newPassword) {
        throw new Error('비밀번호 변경 시 newPassword를 함께 보내야 합니다.');
      }
      return true;
    }),
  body('newPassword')
    .optional()
    .isString()
    .isLength({ min: 8, max: 16 })
    .withMessage('newPassword는 8~16자여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('newPassword는 대/소문자와 숫자를 포함해야 합니다.')
    .custom((newPwd, { req }) => {
      if (newPwd && !req.body.currentPassword) {
        throw new Error('비밀번호 변경 시 currentPassword가 필요합니다.');
      }
      if (
        newPwd &&
        req.body.currentPassword &&
        newPwd === req.body.currentPassword
      ) {
        throw new Error('newPassword는 currentPassword와 달라야 합니다.');
      }
      return true;
    }),
];

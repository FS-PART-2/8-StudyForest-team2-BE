// src/api/checkValidation.js
import { body } from 'express-validator';

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('username은 3~20자여야 합니다.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('username은 영문/숫자/_ 만 사용할 수 있습니다.'),

  body('email')
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 30 })
    .withMessage('비밀번호는 8자 이상 30자 이하여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z0-9]+$/)
    .withMessage(
      '비밀번호는 소문자와 숫자를 포함해야 하며, 대문자/특수문자는 사용할 수 없습니다.',
    ),

  body('nick')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('닉네임은 1~10자여야 합니다.')
    .matches(/^[\p{L}\p{N}_\s]+$/u)
    .withMessage('닉네임은 글자/숫자/언더바/공백만 허용됩니다.'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일을 입력해주세요.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8, max: 30 })
    .withMessage('비밀번호는 8자 이상 30자 이하여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z0-9]+$/)
    .withMessage(
      '비밀번호는 소문자와 숫자를 포함해야 하며, 대문자/특수문자는 사용할 수 없습니다.',
    ),
];

export const validateUpdateMe = [
  body('nick')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('닉네임은 1~10자여야 합니다.')
    .matches(/^[\p{L}\p{N}_\s]+$/u)
    .withMessage('닉네임은 글자/숫자/언더바/공백만 허용됩니다.'),

  body('username')
    .optional()
    .trim()
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
    .isLength({ min: 8, max: 30 })
    .withMessage('currentPassword는 8~30자여야 합니다.')
    .custom((_, { req }) => {
      if (req.body.currentPassword && !req.body.newPassword) {
        throw new Error('비밀번호 변경 시 newPassword를 함께 보내야 합니다.');
      }
      return true;
    }),

  body('newPassword')
    .optional()
    .isString()
    .isLength({ min: 8, max: 30 })
    .withMessage('newPassword는 8~30자여야 합니다.')
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z0-9]+$/)
    .withMessage(
      'newPassword는 소문자와 숫자를 포함해야 하며, 대문자/특수문자는 사용할 수 없습니다.',
    )
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

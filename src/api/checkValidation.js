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

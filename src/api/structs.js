import * as s from 'superstruct';

export const createStudy = s.object({
  nick: s.size(s.string(), 1, 30),
  name: s.size(s.string(), 1, 100),
  content: s.size(s.string(), 0, 2000), // 본문 상한
  img: s.string(), // 허용 경로/확장자
  password: s.size(s.string(), 1, 64),
  checkPassword: s.size(s.string(), 1, 64),
  isActive: s.defaulted(s.boolean(), true), // 기본값 부여
});

export const patchStudy = s.object({
  nick: s.size(s.string(), 1, 30),
  name: s.size(s.string(), 1, 100),
  content: s.size(s.string(), 0, 2000), // 본문 상한
  img: s.string(), // 허용 경로/확장자
  password: s.size(s.string(), 1, 64),
  isActive: s.boolean(),
});

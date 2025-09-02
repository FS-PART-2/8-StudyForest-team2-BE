import * as s from 'superstruct';

export const createStudy = s.object({
  nick: s.size(s.string(), 1, 30),
  name: s.size(s.string(), 1, 100),
  content: s.size(s.string(), 0, 2000),
  img: s.string(),
  password: s.size(s.string(), 1, 64),
  checkPassword: s.size(s.string(), 1, 64),
  isActive: s.defaulted(s.boolean(), true), // 기본값 부여
});

export const patchStudy = s.object({
  nick: s.optional(s.size(s.string(), 1, 30)),
  name: s.optional(s.size(s.string(), 1, 100)),
  content: s.optional(s.size(s.string(), 0, 2000)),
  img: s.optional(s.string()),
  password: s.size(s.string(), 1, 64),
  isActive: s.optional(s.boolean()),
});

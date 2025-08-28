import * as s from 'superstruct';

export const createStudy = s.object({
  nick: s.size(s.string(), 1, 30),
  name: s.size(s.string(), 1, 100),
  content: s.string(),
  img: s.string(),
  password: s.string(),
  checkPassword: s.string(),
  isActive: s.boolean(),
});

export const patchStudy = s.partial(createStudy);

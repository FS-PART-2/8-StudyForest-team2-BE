# API 레이어 구조
| 레이어         | 파일 예시             | 하는 일                       | 하지 말아야 할 일             |
| ----------- | ----------------- | -------------------------- | ---------------------- |
| routes      | `*.routes.js`     | URL·메서드 → 컨트롤러 매핑, 미들웨어 연결 | 비즈니스 로직, DB 접근         |
| controllers | `*.controller.js` | 요청 파싱, 서비스 호출, 응답 반환       | 비즈니스 로직, DB 접근         |
| services    | `*.service.js`    | 도메인/비즈니스 규칙, DB·외부 API 연동  | HTTP 응답 생성, req/res 사용 |

# API 코드 예시

## routes/study.routes.js
```javascript
// src/routes/study.routes.js
import { Router } from 'express';
import * as studyController from '../controllers/study.controller.js';

const router = Router();

router.get('/', studyController.list);
router.get('/:id', studyController.get);
router.post('/', studyController.create);
router.put('/:id', studyController.update);
router.delete('/:id', studyController.remove);

export default router;
```
## controllers/study.controller.js
```javascript
// src/controllers/study.controller.js
import * as studyService from '../services/study.service.js';

export async function list(req, res, next) {
  try {
    const rows = await studyService.listStudies();
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await studyService.getStudy(id);
    if (!row) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(row);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const row = await studyService.createStudy(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const row = await studyService.updateStudy(id, req.body);
    res.status(200).json(row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await studyService.deleteStudy(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
```

## services/study.service.js
```javascript
// src/services/study.service.js
import { prisma } from '../prisma/client.js';

export async function listStudies() {
  return prisma.study.findMany();
}

export async function getStudy(id) {
  return prisma.study.findUnique({ where: { id } });
}

export async function createStudy(data) {
  // 예시: 제목 중복 체크 비즈니스 규칙
  const exists = await prisma.study.findFirst({ where: { title: data.title } });
  if (exists) throw new Error('TITLE_DUPLICATED');

  return prisma.study.create({ data });
}

export async function updateStudy(id, data) {
  return prisma.study.update({ where: { id }, data });
}

export async function deleteStudy(id) {
  return prisma.study.delete({ where: { id } });
}
```
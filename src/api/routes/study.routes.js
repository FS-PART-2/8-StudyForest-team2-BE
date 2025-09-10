// Description: API를 위한 라우터 설정 코드 파일입니다.
// 라이브러리 정의

/**
 * @swagger
 * tags:
 *   - name: Studies
 *     description: 스터디 관리 API
 *
 * components:
 *   parameters:
 *     StudyIdParam:
 *       name: studyId
 *       in: path
 *       required: true
 *       schema: { type: integer, minimum: 1 }
 *       description: 스터디 ID
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: 비밀번호가 누락되었습니다. }
 *         code:
 *           type: string
 *           description: 애플리케이션 정의 오류 코드
 *           example: PASSWORD_REQUIRED
 *
 *     Study:
 *       type: object
 *       description: 스터디 기본 객체
 *       properties:
 *         id: { type: integer, example: 101 }
 *         nick: { type: string, example: kimdy }
 *         name: { type: string, example: 알고리즘 스터디 }
 *         content: { type: string, example: 매주 토요일 10시 온라인 진행 }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner.png
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-02T03:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-09-02T03:00:00.000Z
 *
 *     StudyManageItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 points: { type: integer, example: 12 }
 *                 habitHistories: { type: integer, example: 4 }
 *                 focuses: { type: integer, example: 7 }
 *                 studyEmojis: { type: integer, example: 3 }
 *
 *     StudyListItem:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             _count:
 *               type: object
 *               properties:
 *                 points: { type: integer, example: 12 }
 *                 habitHistories: { type: integer, example: 4 }
 *                 focuses: { type: integer, example: 7 }
 *                 studyEmojis: { type: integer, example: 3 }
 *
 *     StudyListResponse:
 *       type: object
 *       description: 스터디 목록 조회 응답(studies 우선, totalCount 후행)
 *       properties:
 *         studies:
 *           type: array
 *           items: { $ref: '#/components/schemas/StudyListItem' }
 *         totalCount:
 *           type: integer
 *           description: 전체 스터디 개수
 *           example: 14
 *       required:
 *         - studies
 *         - totalCount
 *       example:
 *         studies:
 *           - id: 31
 *             nick: 이서준
 *             name: 이서준의 코딩 테스트 준비 스터디
 *             content: 진도를 맞추어 서로 가르쳐주고 배우는 방식입니다.
 *             img: /img/default.png
 *             isActive: true
 *             createdAt: 2025-09-01T12:32:32.567Z
 *             updatedAt: 2025-09-01T12:32:32.567Z
 *             _count:
 *               points: 1
 *               habitHistories: 1
 *               focuses: 2
 *               studyEmojis: 1
 *         totalCount: 14
 *
 *     StudyDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Study'
 *         - type: object
 *           properties:
 *             studyEmojis:
 *               type: array
 *               description: 스터디 이모지 집계(상세)
 *               items:
 *                 type: object
 *                 properties:
 *                   count: { type: integer, minimum: 0, example: 8 }
 *                   emoji:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 11 }
 *                       symbol: { type: string, example: 1f603 }
 *                       name: { type: string, example: 1f603 }
 *                       createdAt: { type: string, format: date-time, example: 2025-09-02T08:39:46.720Z }
 *                       updatedAt: { type: string, format: date-time, example: 2025-09-02T08:39:46.720Z }
 *             habitHistories:
 *               type: array
 *               description: 주차별 습관 기록
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 10 }
 *                   monDone: { type: boolean, example: true }
 *                   tueDone: { type: boolean, example: true }
 *                   wedDone: { type: boolean, example: true }
 *                   thuDone: { type: boolean, example: true }
 *                   friDone: { type: boolean, example: true }
 *                   satDone: { type: boolean, example: false }
 *                   sunDone: { type: boolean, example: true }
 *                   weekDate: { type: string, format: date-time, example: 2025-08-25T00:00:00.000Z }
 *                   createdAt: { type: string, format: date-time, example: 2025-09-01T12:32:32.647Z }
 *                   updatedAt: { type: string, format: date-time, example: 2025-09-01T12:32:32.647Z }
 *                   studyId: { type: integer, example: 31 }
 *                   habits:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 17 }
 *                         habit: { type: string, example: 물 1리터 마시기 }
 *                         isDone: { type: boolean, example: true }
 *                         date: { type: string, format: date-time, example: 2025-08-31T18:28:12.431Z }
 *                         createdAt: { type: string, format: date-time, example: 2025-09-01T12:32:32.650Z }
 *                         updatedAt: { type: string, format: date-time, example: 2025-09-01T12:32:32.650Z }
 *                         habitHistoryId: { type: integer, example: 10 }
 *             _count:
 *               type: object
 *               properties:
 *                 points: { type: integer, minimum: 0, example: 1 }
 *                 studyEmojis: { type: integer, minimum: 0, example: 2 }
 *                 habitHistories: { type: integer, minimum: 0, example: 1 }
 *             pointsSum:
 *               type: integer
 *               minimum: 0
 *               description: 포인트 합계
 *               example: 5
 *       example:
 *         id: 31
 *         nick: kimdy2
 *         name: 스터디(수정)
 *         content: 수정된 스터디 입니다.
 *         img: https://example.com/banner2.png
 *         isActive: true
 *         createdAt: 2025-09-01T12:32:32.567Z
 *         updatedAt: 2025-09-03T09:26:24.451Z
 *         studyEmojis:
 *           - count: 19
 *             emoji:
 *               id: 1
 *               symbol: 🔥
 *               name: 불
 *               createdAt: 2025-09-01T11:02:59.064Z
 *               updatedAt: 2025-09-01T12:32:32.636Z
 *           - count: 8
 *             emoji:
 *               id: 11
 *               symbol: 1f603
 *               name: 1f603
 *               createdAt: 2025-09-02T08:39:46.720Z
 *               updatedAt: 2025-09-02T08:39:46.720Z
 *         habitHistories:
 *           - id: 10
 *             monDone: true
 *             tueDone: true
 *             wedDone: true
 *             thuDone: true
 *             friDone: true
 *             satDone: false
 *             sunDone: true
 *             weekDate: 2025-08-25T00:00:00.000Z
 *             createdAt: 2025-09-01T12:32:32.647Z
 *             updatedAt: 2025-09-01T12:32:32.647Z
 *             studyId: 31
 *             habits:
 *               - id: 17
 *                 habit: 물 1리터 마시기
 *                 isDone: true
 *                 date: 2025-08-31T18:28:12.431Z
 *                 createdAt: 2025-09-01T12:32:32.650Z
 *                 updatedAt: 2025-09-01T12:32:32.650Z
 *                 habitHistoryId: 10
 *               - id: 18
 *                 habit: 기상 후 스트레칭
 *                 isDone: true
 *                 date: 2025-08-30T22:43:47.311Z
 *                 createdAt: 2025-09-01T12:32:32.650Z
 *                 updatedAt: 2025-09-01T12:32:32.650Z
 *                 habitHistoryId: 10
 *         _count:
 *           points: 1
 *           studyEmojis: 2
 *           habitHistories: 1
 *         pointsSum: 5
 *
 *     StudyCreateInput:
 *       type: object
 *       required: [nick, name, content, password, checkPassword]
 *       properties:
 *         nick: { type: string, example: kimdy }
 *         name: { type: string, example: 알고리즘 스터디 }
 *         content: { type: string, example: 매주 토요일 10시 온라인 진행 }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner.png
 *         password: { type: string, example: 'p@ssW0rd!' }
 *         checkPassword: { type: string, example: 'p@ssW0rd!' }
 *         isActive: { type: boolean, example: true }
 *
 *     StudyUpdateInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         nick: { type: string, example: kimdy2 }
 *         name: { type: string, example: 스터디(수정) }
 *         content: { type: string, example: 수정된 스터디 입니다. }
 *         img:
 *           type: string
 *           nullable: true
 *           example: https://example.com/banner2.png
 *         password: { type: string, example: 'p@ssW0rd!' }
 *         isActive: { type: boolean, example: true }
 *
 *     StudyDeleteInput:
 *       type: object
 *       required: [password]
 *       properties:
 *         password: { type: string, example: 'p@ssW0rd!' }
 *
 *     EmojiCountInput:
 *       type: object
 *       required: [id, count]
 *       properties:
 *         id:
 *           description: 이모지 식별자(심볼 또는 정수 ID)
 *           oneOf:
 *             - type: string
 *               description: 이모지 유니코드 코드포인트(16진수)
 *               pattern: '^[0-9a-fA-F]{4,8}$'
 *               example: 1f603
 *             - type: integer
 *               description: 이모지의 내부 정수 ID
 *               example: 11
 *         count:
 *           type: integer
 *           minimum: 1
 *           description: 증가/감소 수량(양의 정수)
 *           example: 1
 *
 *     StudyEmoji:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 23 }
 *         count:     { type: integer, example: 7 }
 *         createdAt: { type: string, format: date-time, example: 2025-09-03T09:01:20.479Z }
 *         updatedAt: { type: string, format: date-time, example: 2025-09-03T09:11:04.085Z }
 *         studyId:   { type: integer, example: 31 }
 *         emojiId:   { type: integer, example: 11 }
 *         emoji:
 *           type: object
 *           nullable: true
 *           properties:
 *             symbol:
 *               type: string
 *               description: 이모지 코드포인트(16진수) 또는 문자
 *               example: 1f603
 *
 *     EmojiUpdated:
 *       allOf:
 *         - $ref: '#/components/schemas/StudyEmoji'
 *
 *     EmojiDeleted:
 *       type: object
 *       properties:
 *         deleted: { type: boolean, example: true }
 *         studyId: { type: integer, example: 31 }
 *         emojiId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         count: { type: integer, example: 0 }
 *         reason:
 *           type: string
 *           nullable: true
 *           description: 'not-exists | emoji-not-found | race 등'
 *           example: not-exists
 *
 *     EmojiActionResult:
 *       oneOf:
 *         - $ref: '#/components/schemas/EmojiUpdated'
 *         - $ref: '#/components/schemas/EmojiDeleted'
 *
 * paths:
 *     /api/studies/{studyId}:
 *     get:
 *       summary: 스터디 상세조회
 *       tags: [Studies]
 *       parameters:
 *         - $ref: '#/components/parameters/StudyIdParam'
 *       responses:
 *         200:
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/StudyDetail'
 *               examples:
 *                 populated:
 *                   value:
 *                     id: 31
 *                     nick: kimdy2
 *                     name: 스터디(수정)
 *                     content: 수정된 스터디 입니다.
 *                     img: https://example.com/banner2.png
 *                     isActive: true
 *                     createdAt: 2025-09-01T12:32:32.567Z
 *                     updatedAt: 2025-09-03T09:26:24.451Z
 *                     studyEmojis:
 *                       - count: 19
 *                         emoji:
 *                           id: 1
 *                           symbol: 🔥
 *                           name: 불
 *                           createdAt: 2025-09-01T11:02:59.064Z
 *                           updatedAt: 2025-09-01T12:32:32.636Z
 *                       - count: 8
 *                         emoji:
 *                           id: 11
 *                           symbol: 1f603
 *                           name: 1f603
 *                           createdAt: 2025-09-02T08:39:46.720Z
 *                           updatedAt: 2025-09-02T08:39:46.720Z
 *                     habitHistories:
 *                       - id: 10
 *                         monDone: true
 *                         tueDone: true
 *                         wedDone: true
 *                         thuDone: true
 *                         friDone: true
 *                         satDone: false
 *                         sunDone: true
 *                         weekDate: 2025-08-25T00:00:00.000Z
 *                         createdAt: 2025-09-01T12:32:32.647Z
 *                         updatedAt: 2025-09-01T12:32:32.647Z
 *                         studyId: 31
 *                         habits:
 *                           - id: 17
 *                             habit: 물 1리터 마시기
 *                             isDone: true
 *                             date: 2025-08-31T18:28:12.431Z
 *                             createdAt: 2025-09-01T12:32:32.650Z
 *                             updatedAt: 2025-09-01T12:32:32.650Z
 *                             habitHistoryId: 10
 *                           - id: 18
 *                             habit: 기상 후 스트레칭
 *                             isDone: true
 *                             date: 2025-08-30T22:43:47.311Z
 *                             createdAt: 2025-09-01T12:32:32.650Z
 *                             updatedAt: 2025-09-01T12:32:32.650Z
 *                             habitHistoryId: 10
 *                     _count:
 *                       points: 1
 *                       studyEmojis: 2
 *                       habitHistories: 1
 *                     pointsSum: 5
 *                 empty:
 *                   value:
 *                     id: 33
 *                     nick: kimdy
 *                     name: 알고리즘 스터디
 *                     content: 매주 토요일 10시 온라인 진행
 *                     img: https://example.com/banner.png
 *                     isActive: true
 *                     createdAt: 2025-09-03T08:45:46.916Z
 *                     updatedAt: 2025-09-03T08:45:46.916Z
 *                     studyEmojis: []
 *                     habitHistories: []
 *                     _count:
 *                       points: 0
 *                       studyEmojis: 0
 *                       habitHistories: 0
 *                     pointsSum: 0
 *
 */

/**
 * @swagger
 * /api/studies/manage:
 *   get:
 *     tags: [Studies]
 *     summary: 관리용 전체 스터디 목록 조회
 *     description: 관리자 화면용 상세 필드/카운트 포함 목록
 *     responses:
 *       200:
 *         description: 스터디 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/StudyManageItem' }
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @swagger
 * /api/studies:
 *   get:
 *     tags: [Studies]
 *     summary: 스터디 목록 조회
 *     description: |
 *       스터디 목록을 페이징으로 조회합니다.
 *       - 정렬은 `sort` 파라미터 하나만 사용합니다. (`recent` | `old` | `points_desc` | `points_asc`)
 *       - 하위 호환: `recentOrder`, `pointOrder`가 전달되면 내부적으로 `sort`로 매핑됩니다.
 *       - 각 스터디 객체에는 이모지 상위 3개(`studyEmojis`)와 포인트 총합(`point`)이 포함됩니다.
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *         example: 0
 *         description: 건너뛸 레코드 수
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 6 }
 *         example: 6
 *         description: 최대 조회 건수
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         example: 알고리즘
 *         description: 이름/내용 부분 일치 검색
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, old, points_desc, points_asc]
 *           default: recent
 *         example: points_desc
 *         description: 정렬 기준(최근/오래된/포인트 내림차순/오름차순)
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *         example: true
 *         description: 활성화 상태 필터(true/false)
 *     responses:
 *       200:
 *         description: 페이징 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudyListResponse'
 *             examples:
 *               sample:
 *                 value:
 *                   studies:
 *                     - id: 5
 *                       nick: 테스트
 *                       name: 스터디 생성 테스트
 *                       content: 스터디 생성 테스트 중 입니다.
 *                       img: https://avatars.githubusercontent.com/in/347564?s=60&v=4
 *                       isActive: true
 *                       createdAt: "2025-09-09T01:35:00.041Z"
 *                       updatedAt: "2025-09-09T01:35:00.041Z"
 *                       studyEmojis: []
 *                       point: 0
 *                     - id: 1
 *                       nick: 강현우
 *                       name: 강현우의 운영체제 공부 스터디
 *                       content: 온라인/오프라인 병행 스터디입니다.
 *                       img: /img/img-08.png
 *                       isActive: true
 *                       createdAt: "2025-09-09T01:14:31.061Z"
 *                       updatedAt: "2025-09-09T01:14:31.061Z"
 *                       studyEmojis:
 *                         - count: 9
 *                           emoji:
 *                             id: 1
 *                             symbol: "🔥"
 *                       point: 995
 *                   totalCount: 2
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 생성
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyCreateInput' }
 *     responses:
 *       201:
 *         description: 생성 성공
 *         headers:
 *           Location:
 *             description: 생성된 리소스 경로(`/api/studies/{id}`)
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Study' }
 *       400:
 *         description: 유효성 오류(비밀번호 미일치 등)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/studies/{studyId}:
 *   get:
 *     tags: [Studies]
 *     summary: 스터디 상세 조회
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     responses:
 *       200:
 *         description: 상세
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudyDetail' }
 *       400:
 *         description: 잘못된 ID
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 *
 *   patch:
 *     tags: [Studies]
 *     summary: 스터디 수정
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyUpdateInput' }
 *     responses:
 *       200:
 *         description: 수정된 스터디
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Study' }
 *       400:
 *         description: 유효성 오류
 *       403:
 *         description: 비밀번호 불일치 등
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 *
 *   delete:
 *     tags: [Studies]
 *     summary: 스터디 삭제
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/StudyDeleteInput' }
 *     responses:
 *       204:
 *         description: 삭제 성공(본문 없음)
 *       400:
 *         description: 비밀번호 누락 등
 *       403:
 *         description: 비밀번호 불일치
 *       404:
 *         description: 존재하지 않는 스터디
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/studies/{studyId}/emojis/increment:
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 이모지 카운트 증가
 *     description: 요청 본문의 id(이모지 심볼/식별자)와 count(증가 수량)를 사용합니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmojiCountInput' }
 *     responses:
 *       200:
 *         description: 증가 후 최신 레코드
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EmojiUpdated' }
 *       400:
 *         description: 유효성 오류(id/count 누락/형식 불일치)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: 대상 스터디 없음
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/studies/{studyId}/emojis/decrement:
 *   post:
 *     tags: [Studies]
 *     summary: 스터디 이모지 카운트 감소/삭제
 *     description: 현재 카운트보다 많이 감소 요청 시 레코드가 삭제될 수 있습니다.
 *     parameters:
 *       - $ref: '#/components/parameters/StudyIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmojiCountInput' }
 *     responses:
 *       200:
 *         description: 감소 결과(감소 또는 삭제)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EmojiActionResult' }
 *       400:
 *         description: 유효성 오류(id/count 누락/형식 불일치)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: 대상 스터디 없음
 *       500:
 *         description: 서버 에러
 */

import express from 'express';

// 미들웨어 정의
import corsMiddleware from '../../common/cors.js';
import errorMiddleware from '../../common/error.js'; // 에러를 추가할 일이 있다면, 해당 파일에 케이스를 추가해주시기 바랍니다.

// 컨트롤러 정의
import studyController from '../controllers/study.controllers.js';

const router = express.Router();

router.use(corsMiddleware); // CORS 미들웨어 적용

// 관리를 위한 전체 스터디 목록 조회 API 엔드포인트
router.get(
  '/manage',
  errorMiddleware.asyncHandler(studyController.controlGetStudy),
);

// 스터디 목록 조회 API 엔드포인트
router.get('/', errorMiddleware.asyncHandler(studyController.controlStudyList));

// 스터디 생성 API 엔드포인트
router.post(
  '/',
  errorMiddleware.asyncHandler(studyController.controlStudyCreate),
);

// 스터디 수정 API 엔드포인트
router.patch(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyUpdate),
);

// 스터디 삭제 API 엔드포인트
router.delete(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyDelete),
);

// 스터디 상세조회 API 엔드포인트
router.get(
  '/:studyId',
  errorMiddleware.asyncHandler(studyController.controlStudyDetail),
);

// 이모지 횟수 증가 API 엔드포인트
router.post(
  '/:studyId/emojis/increment',
  errorMiddleware.asyncHandler(studyController.controlEmojiIncrement),
);

// 이모지 횟수 감소 API 엔드포인트
router.post(
  '/:studyId/emojis/decrement',
  errorMiddleware.asyncHandler(studyController.controlEmojiDecrement),
);

// 에러 핸들링 미들웨어 적용, 가장 마지막에 위치해야 합니다.
router.use(errorMiddleware.errorHandler);

export default router;

// 아래 코드는 예시 코드입니다.

// /**
//  * Swagger API 문서 설정
//  *
//  * 이 파일은 OpenAPI 3.0 표준을 따르는 Swagger 문서를 설정합니다.
//  * API 엔드포인트들이 자동으로 문서화되며, 대화형 API 테스트 도구를 제공합니다.
//  */
//
// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
//
// // Swagger 기본 설정
// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: '🛍️ Express API with Modern ES6 Modules',
//       version: '1.0.0',
//       description: `
//         **부트캠프용 학습 프로젝트**: Express.js 기반의 RESTful API 서버
//
//         ## 🎯 주요 기능
//         - 🔐 **JWT 기반 인증**: 회원가입, 로그인, 프로필 관리
//         - 📦 **상품 관리**: CRUD, 검색, 필터링, 페이지네이션
//         - 💬 **댓글 시스템**: 댓글/대댓글, 평점 시스템
//         - ❤️ **찜하기**: 상품 찜하기 관리
//         - 🛒 **장바구니**: 장바구니 관리 및 수량 조절
//
//         ## 🏗️ 기술 스택
//         - **Backend**: Express.js with ES6 Modules
//         - **Database**: PostgreSQL with Prisma ORM
//         - **Authentication**: JWT (JSON Web Token)
//         - **Validation**: express-validator
//         - **Security**: Helmet, CORS, bcryptjs
//
//         ## 🔗 유용한 링크
//         - [GitHub Repository](#)
//         - [프로젝트 문서](README.md)
//       `,
//       contact: {
//         name: '부트캠프 API 지원',
//         email: 'support@bootcamp.com'
//       },
//       license: {
//         name: 'MIT',
//         url: 'https://opensource.org/licenses/MIT'
//       }
//     },
//     servers: [
//       {
//         url: 'http://localhost:3000',
//         description: '개발 서버'
//       },
//       {
//         url: 'https://api.example.com',
//         description: '프로덕션 서버 (예시)'
//       }
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//           description: 'JWT 토큰을 Authorization 헤더에 Bearer 형식으로 포함해주세요. 예: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`'
//         }
//       },
//       schemas: {
//         User: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               description: '사용자 고유 ID',
//               example: 1
//             },
//             email: {
//               type: 'string',
//               format: 'email',
//               description: '사용자 이메일 (로그인 ID)',
//               example: 'user@example.com'
//             },
//             name: {
//               type: 'string',
//               description: '사용자 이름',
//               example: '홍길동',
//               minLength: 2,
//               maxLength: 50
//             },
//             role: {
//               type: 'string',
//               enum: ['user', 'admin'],
//               description: '사용자 역할',
//               example: 'user'
//             },
//             createdAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '계정 생성 시간',
//               example: '2025-08-22T00:16:42.487Z'
//             },
//             updatedAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '계정 수정 시간',
//               example: '2025-08-22T00:16:42.487Z'
//             }
//           }
//         },
//         Product: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               description: '상품 고유 ID',
//               example: 1
//             },
//             name: {
//               type: 'string',
//               description: '상품명',
//               example: '아이폰 14',
//               minLength: 2,
//               maxLength: 100
//             },
//             description: {
//               type: 'string',
//               description: '상품 설명',
//               example: '최신 아이폰 14 모델입니다. 뛰어난 성능과 카메라 품질을 제공합니다.',
//               maxLength: 1000
//             },
//             price: {
//               type: 'number',
//               format: 'float',
//               description: '상품 가격 (원)',
//               example: 1200000,
//               minimum: 0
//             },
//             category: {
//               type: 'string',
//               enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'etc'],
//               description: '상품 카테고리',
//               example: 'electronics'
//             },
//             stock: {
//               type: 'integer',
//               description: '재고 수량',
//               example: 50,
//               minimum: 0
//             },
//             images: {
//               type: 'array',
//               items: {
//                 type: 'string'
//               },
//               description: '상품 이미지 URL 목록',
//               example: ['iphone14-1.jpg', 'iphone14-2.jpg']
//             },
//             status: {
//               type: 'string',
//               enum: ['active', 'inactive', 'deleted'],
//               description: '상품 상태',
//               example: 'active'
//             },
//             sellerId: {
//               type: 'integer',
//               description: '판매자 ID',
//               example: 1
//             },
//             createdAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '상품 등록 시간'
//             },
//             updatedAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '상품 수정 시간'
//             }
//           }
//         },
//         Comment: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'integer',
//               description: '댓글 고유 ID',
//               example: 1
//             },
//             content: {
//               type: 'string',
//               description: '댓글 내용',
//               example: '정말 좋은 상품이네요! 추천합니다.',
//               minLength: 1,
//               maxLength: 500
//             },
//             rating: {
//               type: 'integer',
//               minimum: 1,
//               maximum: 5,
//               description: '상품 평점 (1-5점, 대댓글은 null)',
//               example: 5,
//               nullable: true
//             },
//             parentId: {
//               type: 'integer',
//               description: '부모 댓글 ID (대댓글인 경우)',
//               example: null,
//               nullable: true
//             },
//             userId: {
//               type: 'integer',
//               description: '작성자 ID',
//               example: 1
//             },
//             productId: {
//               type: 'integer',
//               description: '상품 ID',
//               example: 1
//             },
//             status: {
//               type: 'string',
//               enum: ['active', 'deleted'],
//               description: '댓글 상태',
//               example: 'active'
//             },
//             createdAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '댓글 작성 시간'
//             },
//             updatedAt: {
//               type: 'string',
//               format: 'date-time',
//               description: '댓글 수정 시간'
//             }
//           }
//         },
//         Error: {
//           type: 'object',
//           properties: {
//             success: {
//               type: 'boolean',
//               description: '요청 성공 여부',
//               example: false
//             },
//             error: {
//               type: 'string',
//               description: '에러 메시지',
//               example: 'Validation failed'
//             },
//             details: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   field: {
//                     type: 'string',
//                     description: '에러가 발생한 필드명'
//                   },
//                   message: {
//                     type: 'string',
//                     description: '상세 에러 메시지'
//                   }
//                 }
//               },
//               description: '상세 에러 정보 (유효성 검사 실패 시)'
//             }
//           }
//         },
//         Success: {
//           type: 'object',
//           properties: {
//             success: {
//               type: 'boolean',
//               description: '요청 성공 여부',
//               example: true
//             },
//             message: {
//               type: 'string',
//               description: '성공 메시지',
//               example: '성공적으로 처리되었습니다'
//             },
//             data: {
//               type: 'object',
//               description: '응답 데이터',
//               additionalProperties: true
//             }
//           }
//         },
//         PaginationMeta: {
//           type: 'object',
//           properties: {
//             currentPage: {
//               type: 'integer',
//               description: '현재 페이지 번호',
//               example: 1
//             },
//             totalPages: {
//               type: 'integer',
//               description: '전체 페이지 수',
//               example: 5
//             },
//             totalItems: {
//               type: 'integer',
//               description: '전체 아이템 수',
//               example: 50
//             },
//             itemsPerPage: {
//               type: 'integer',
//               description: '페이지당 아이템 수',
//               example: 10
//             },
//             hasNextPage: {
//               type: 'boolean',
//               description: '다음 페이지 존재 여부',
//               example: true
//             },
//             hasPrevPage: {
//               type: 'boolean',
//               description: '이전 페이지 존재 여부',
//               example: false
//             }
//           }
//         }
//       },
//       parameters: {
//         PageQuery: {
//           name: 'page',
//           in: 'query',
//           description: '페이지 번호 (1부터 시작)',
//           required: false,
//           schema: {
//             type: 'integer',
//             minimum: 1,
//             default: 1
//           }
//         },
//         LimitQuery: {
//           name: 'limit',
//           in: 'query',
//           description: '페이지당 아이템 수 (최대 100)',
//           required: false,
//           schema: {
//             type: 'integer',
//             minimum: 1,
//             maximum: 100,
//             default: 10
//           }
//         }
//       },
//       responses: {
//         UnauthorizedError: {
//           description: '인증 실패 - 유효하지 않은 토큰',
//           content: {
//             'application/json': {
//               schema: {
//                 $ref: '#/components/schemas/Error'
//               },
//               example: {
//                 success: false,
//                 error: 'Invalid token',
//                 message: 'Token is not valid'
//               }
//             }
//           }
//         },
//         ForbiddenError: {
//           description: '권한 없음 - 접근 권한이 없습니다',
//           content: {
//             'application/json': {
//               schema: {
//                 $ref: '#/components/schemas/Error'
//               },
//               example: {
//                 success: false,
//                 error: 'Access denied',
//                 message: 'You do not have permission to access this resource'
//               }
//             }
//           }
//         },
//         ValidationError: {
//           description: '입력 데이터 검증 실패',
//           content: {
//             'application/json': {
//               schema: {
//                 $ref: '#/components/schemas/Error'
//               },
//               example: {
//                 success: false,
//                 error: 'Validation failed',
//                 message: 'Invalid input data',
//                 details: [
//                   {
//                     field: 'email',
//                     message: '유효한 이메일 주소를 입력해주세요'
//                   }
//                 ]
//               }
//             }
//           }
//         },
//         NotFoundError: {
//           description: '리소스를 찾을 수 없음',
//           content: {
//             'application/json': {
//               schema: {
//                 $ref: '#/components/schemas/Error'
//               },
//               example: {
//                 success: false,
//                 error: 'Not found',
//                 message: '요청한 리소스를 찾을 수 없습니다'
//               }
//             }
//           }
//         }
//       }
//     },
//     tags: [
//       {
//         name: '인증',
//         description: '사용자 인증 관련 API (회원가입, 로그인, 프로필 관리)'
//       },
//       {
//         name: '상품',
//         description: '상품 관련 API (CRUD, 검색, 필터링)'
//       },
//       {
//         name: '댓글',
//         description: '댓글 관련 API (댓글/대댓글 CRUD, 평점 시스템)'
//       },
//       {
//         name: '찜하기',
//         description: '상품 찜하기 관련 API'
//       },
//       {
//         name: '장바구니',
//         description: '장바구니 관련 API'
//       }
//     ]
//   },
//   apis: [
//     './src/routes/*.js', // 라우트 파일들에서 Swagger 주석을 읽어옵니다
//     './app.js'           // 메인 앱 파일의 주석도 포함
//   ]
// };
//
// // Swagger 사양 생성
// const specs = swaggerJsdoc(options);
//
// // Swagger UI 옵션 설정
// const swaggerUiOptions = {
//   explorer: true,
//   swaggerOptions: {
//     persistAuthorization: true, // 새로고침 후에도 Authorization 헤더 유지
//     displayRequestDuration: true, // 요청 시간 표시
//     filter: true, // 검색 기능 활성화
//     showCommonExtensions: true,
//     syntaxHighlight: {
//       theme: 'agate' // 코드 하이라이팅 테마
//     }
//   },
//   customCss: `
//     .swagger-ui .topbar { display: none; }
//     .swagger-ui .info .title { color: #3b82f6; }
//     .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px; }
//   `,
//   customSiteTitle: '🛍️ Express API 문서',
//   customfavIcon: '/favicon.ico'
// };
//
// export { specs, swaggerUiOptions };

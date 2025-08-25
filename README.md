# 8-StudyForest-team2-BE

## 폴더 구조
```text
/
|- /http # HTTP 요청 파일 (API 테스트 용도)
|  |- study.http
|  |- habit.http
|  |- concentrate.http
|- /src
|  |- app.js # express의 초기화 및 서버의 구동(listen)을 담당
|  |- /config # cors, logger, swagger 설정 파일
|  |  |- cors.js
|  |  |- logger.js
|  |  |- swagger.js
|  |- /common # 공용: 에러 정의, 미들웨어 등
|  |- /api # API 기능 단위 분할
|  |  |- routes/ # URL·HTTP 메서드와 컨트롤러 함수를 매핑하는 진입점
|  |  |  |- study.routes.js
|  |  |  |- habit.routes.js
|  |  |  |- concentrate.routes.js
|  |  |- controllers/ # 요청 파싱(params/query/body) + 입력 검증 결과 처리
|  |  |  |- study.controllers.js
|  |  |  |- habit.controllers.js
|  |  |  |- concentrate.controllers.js
|  |  |- services/ # 핵심 비즈니스 로직이 들어가는 코드
|  |  |  |- study.services.js
|  |  |  |- habit.services.js
|  |  |  |- concentrate.services.js
|  |- /prisma # Prisma 스키마, seed/mock 데이터 파일
|  |  |- schema.prisma
|  |  |- migrations/
|  |  |- seed.js
|- /node_modules # nodejs 패키지 설치 파일
|- package.json
|- .gitignore
|- .env.production # 전역 환경변수 파일 (배포용)
|- .env # 환경변수 파일 (로컬 설정) 
|- README.md
```

## 네이밍 컨벤션
> ### 변수
> - Case
>  - 일반변수: camelCase
>  - 상수: UPPER_SNAKE_CASE
> - Convention
>  - 일반 변수 ex. userName)
>  - 상수 : ex. const MIN_WAIT_TIME = 9;

> ### 함수
>- Case
>  - camelCase
>- Convention
>  - ex) handleChangeName = () ⇒ {}

>### 파일
>- Case
>  - kebab-case
>- Convention
>  - 이미지 파일 : user-profile-avatar.svg

>### 폴더명
>- Case
>  - camelCase
>- Convention
>  - 일반 : components, atom, molecule, pages

## Git Flow 브랜치 전략
- main → 배포 브랜치
- develop → 개발 브랜치
- feature → 기능 단위
  - feat/login → 기능 추가 개발브랜치 pr날려서 머지하는 방식
- hotfix → 급한 버그

## Git Commit 메시지 컨벤션
```text
# ------------------------------------------(50)|
# 제목 - 50자 이내로 요약 / 변경사항이 "무엇"인지 명확하게

# <타입>: <제목>의 형식으로 작성 / 예) feat: 로그인 기능 추가

# ---------------------------------------------------------------------
- 제목에서의 <타입> 설명
# feat : 새로운 기능 추가
# fix : 버그 수정
# design : CSS, UI 디자인 변경
# docs : 문서 추가, 수정, 삭제
# test : 테스트 코드 추가, 수정, 삭제
# refactor: 코드 리팩토링
# style : 기능에 영향을 주지 않는 코드 형식 변경
# chore : 빌드 스크립트, 패키지 매니저 수정
# rename : 파일 혹은 폴더명을 수정하거나 옮기는 작업
# remove : 파일을 삭제하는 작업
# add : 파일추가
# etc : 기타 작업
# init : 프로젝트 초기 세팅
---------------------------------------------------------------------

# - 커밋 메시지 예시
# feat: 로그인 기능 추가
# docs: readme.md 파일 수정
```

## 기술 스택
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Prisma ORM
- **Documentation**: Swagger
- **HTTP Client**: 테스트용 .http 파일

## 설치 및 실행

### 환경 설정
1. 환경변수 파일 설정
2. 데이터베이스 마이그레이션
3. Seed 데이터 실행

### 개발 서버 실행
\`\`\`bash
npm install
npm run dev
\`\`\`
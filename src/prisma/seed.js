import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const randBool = () => faker.helpers.arrayElement([true, false]);
const recentDate = (days = 7) => faker.date.recent({ days });
const pickTwoDistinct = arr => {
  const a = faker.helpers.arrayElement(arr);
  let b = faker.helpers.arrayElement(arr);
  if (a === b) b = faker.helpers.arrayElement(arr.filter(x => x !== a));
  return [a, b];
};

//  한국인 이름 샘플
const KOREAN_NAMES = [
  '김민준',
  '이서준',
  '박도윤',
  '최하준',
  '정서윤',
  '한지우',
  '조하은',
  '장지호',
  '윤예은',
  '서지민',
  '강현우',
  '임민서',
  '오유진',
  '신수아',
  '권주원',
];

//  스터디 주제
const STUDY_SUBJECTS = [
  '알고리즘 문제 풀이',
  '영어 단어 암기',
  '수학 문제 풀이',
  '코딩 테스트 준비',
  'CS 기본기 학습',
  '자료구조 복습',
  '논문 리뷰 모임',
  '독서 토론',
  '웹 개발',
  '데이터베이스 심화',
  '네트워크 이론',
  '운영체제 공부',
  'AI/머신러닝 기초',
];

//  스터디 분위기 설명
const STUDY_CONTENTS = [
  '매일 문제 풀이를 공유하고 피드백합니다.',
  '꾸준한 학습 습관을 만들고자 합니다.',
  '같이 공부하며 서로 동기부여 해요.',
  '스터디원을 모집합니다: 함께 성실히 공부할 분!',
  '주간 계획을 세우고 성과를 공유합니다.',
  '온라인/오프라인 병행 스터디입니다.',
  '진도를 맞추어 서로 가르쳐주고 배우는 방식입니다.',
  '토론을 통해 깊은 이해를 목표로 합니다.',
  '시험 준비를 위해 모였습니다.',
  '기록과 인증으로 꾸준함을 유지합니다.',
];

//  습관
const HABITS = [
  '물 1리터 마시기',
  '운동 30분 하기',
  '기상 후 스트레칭',
  '영어 단어 30개 외우기',
  '독서 20분',
];

async function seedUsers(n = 5) {
  // 고유한 한국인 이름 n개 선택 (부족하면 중복 허용)
  const baseNames =
    KOREAN_NAMES.length >= n
      ? faker.helpers.arrayElements(KOREAN_NAMES, n)
      : Array.from({ length: n }).map(() =>
          faker.helpers.arrayElement(KOREAN_NAMES),
        );
  const users = baseNames.map(name => ({
    username: name,
    // NOTE: 개발 시드이므로 평문. 운영 사용 시 해시 필수.
    password: faker.internet.password({
      length: faker.number.int({ min: 8, max: 16 }),
    }),
    // ASCII 안전 + 재실행 시 충돌 완화
    email: `${faker.string.alphanumeric({ length: 10, casing: 'lower' })}@example.com`,
    nick: name,
  }));
  await prisma.user.createMany({
    data: users,
    skipDuplicates: true, // 유니크 충돌 시 무시
  });
}

async function seedStudies(n = 2) {
  return Promise.all(
    Array.from({ length: n }).map(() => {
      const leader = faker.helpers.arrayElement(KOREAN_NAMES);
      const subject = faker.helpers.arrayElement(STUDY_SUBJECTS);
      return prisma.study.create({
        data: {
          nick: leader,
          name: `${leader}의 ${subject} 스터디`, // 이름 + 주제
          content: faker.helpers.arrayElement(STUDY_CONTENTS),
          img: '/img/default.png',
          password: faker.internet.password({
            length: faker.number.int({ min: 8, max: 16 }),
          }),
          isActive: randBool(),
        },
      });
    }),
  );
}

async function seedEmojisBase() {
  const fire = await prisma.emoji.upsert({
    where: { symbol: '🔥' },
    update: { name: '불' },
    create: { symbol: '🔥', name: '불' },
  });
  const thumbs = await prisma.emoji.upsert({
    where: { symbol: '👍' },
    update: { name: '따봉' },
    create: { symbol: '👍', name: '따봉' },
  });
  return [fire, thumbs];
}

async function seedPerStudy(study, emojis) {
  await prisma.$transaction(async tx => {
    const habitHistory = await tx.habitHistory.create({
      data: {
        studyId: study.id,
        weekDate: recentDate(7),
        monDone: randBool(),
        tueDone: randBool(),
        wedDone: randBool(),
        thuDone: randBool(),
        friDone: randBool(),
        satDone: randBool(),
        sunDone: randBool(),
      },
    });

    const [h1, h2] = pickTwoDistinct(HABITS);
    const d1 = recentDate(3);
    let d2 = recentDate(3);
    if (d2.toDateString() === d1.toDateString()) {
      d2 = new Date(d1.getTime() - 24 * 60 * 60 * 1000);
    }

    await tx.habit.createMany({
      data: [
        {
          habit: h1,
          isDone: randBool(),
          date: d1,
          habitHistoryId: habitHistory.id,
        },
        {
          habit: h2,
          isDone: randBool(),
          date: d2,
          habitHistoryId: habitHistory.id,
        },
      ],
    });

    await tx.focus.createMany({
      data: [
        { setTime: faker.date.soon({ days: 3 }), studyId: study.id },
        { setTime: faker.date.soon({ days: 3 }), studyId: study.id },
      ],
    });

    await tx.point.create({
      data: {
        point: faker.number.int({ min: 5, max: 50 }),
        value: faker.number.int({ min: 1, max: 10 }),
        studyId: study.id,
      },
    });

    await tx.studyEmoji.create({
      data: {
        studyId: study.id,
        emojiId: emojis[0].id,
        count: faker.number.int({ min: 1, max: 20 }),
      },
    });
  });
}

async function main() {
  await seedUsers(5);
  const studies = await seedStudies(2);
  const emojis = await seedEmojisBase();
  await Promise.all(studies.map(s => seedPerStudy(s, emojis)));
  console.log('🌱 Faker seed data inserted!');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async e => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

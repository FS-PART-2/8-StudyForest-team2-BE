// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// 관리를 위한 전체 스터디 목록 조회 API 서비스
async function serviceGetStudy(){
  try {
    return await prisma.study.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nick: true,
        name: true,
        content: true,
        img: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            points: true,
            habitHistories: true,
            focuses: true,
            studyEmojis: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

// 스터디 목록 조회 API 서비스
async function serviceStudyList(options) {
  const { offset, limit, keyword, pointOrder, recentOrder } = options;
  const where = {
    isActive: true,
    ...(keyword
      ? {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        }
      : {}),
  };

  try {
    const [studies, totalCount] = await Promise.all([
      prisma.study.findMany({
        where,
        orderBy: [
          {
            points: {
              _count: pointOrder === 'desc' ? 'desc' : 'asc',
            },
          },
          { createdAt: recentOrder === 'recent' ? 'desc' : 'asc' },
        ],
        skip: offset,
        take: Math.min(limit, 50),
        select: {
          id: true,
          nick: true,
          name: true,
          content: true,
          img: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              points: true,
              habitHistories: true,
              focuses: true,
              studyEmojis: true,
            },
          },
        },
      }),
      prisma.study.count({ where }),
    ]);

    return { studies, totalCount };
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

async function serviceStudyCreate(
  nick,
  name,
  content,
  img,
  passwordHash,
  isActive,
) {
  try {
    return await prisma.study.create({
      data: { nick, name, content, img, password: passwordHash, isActive },
      select: {
        id: true,
        nick: true,
        name: true,
        content: true,
        img: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

async function serviceStudyUpdate(
  studyId,
  nick,
  name,
  content,
  img,
  password,
  isActive,
){
  try {
    // studyId에 해당하는 스터디의 해시된 비밀번호를 DB에서 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { password: true },
    });
    if (!study) {
      const err = new Error('존재하지 않는 스터디 ID입니다.');
      err.status = 404;
      err.code = 'STUDY_NOT_FOUND';
      throw err;
    }
    // 비밀번호 일치 여부 확인
    const isPasswordValid = await argon2.verify(study.password, password);
    if (!isPasswordValid) {
      const err = new Error('비밀번호가 일치하지 않습니다.');
      err.status = 403;
      err.code = 'INVALID_PASSWORD';
      throw err;
    }

    // 스터디 정보 업데이트
    return await prisma.study.update({
      where: { id: studyId },
      data: { nick, name, content, img, isActive },
      select: {
        id: true,
        nick: true,
        name: true,
        content: true,
        img: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

async function serviceStudyDelete(studyId, password) {
  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { password: true },
    });
    if (!study) {
      const err = new Error('존재하지 않는 스터디 ID입니다.');
      err.status = 404;
      err.code = 'STUDY_NOT_FOUND';
      throw err;
    }

    if (!password) {
      const err = new Error('비밀번호가 누락되었습니다.');
      err.status = 400;
      err.code = 'PASSWORD_REQUIRED';
      throw err;
    }

    const isPasswordValid = await argon2.verify(study.password, password);
    if (!isPasswordValid) {
      const err = new Error('비밀번호가 일치하지 않습니다.');
      err.status = 403;
      err.code = 'INVALID_PASSWORD';
      throw err;
    }

    await prisma.study.delete({ where: { id: studyId } });

    return { message: '스터디가 성공적으로 삭제되었습니다.' };
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

async function serviceStudyDetail(studyId) {
  try {
    const [detail, pointsAgg] = await Promise.all([
      prisma.study.findUnique({
        where: { id: studyId /* 필요 시 isActive: true 추가 고려 */ },
        select: {
          id: true,
          nick: true,
          name: true,
          content: true,
          img: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          studyEmojis: {
            select: {
              count: true,
              emoji: true, // 관계 필드 가정: 이모지 정보 포함
            },
            orderBy: { count: 'desc' },
          },
          habitHistories: {
            orderBy: { weekDate: 'desc' },
            take: 1, // 최신 1개만 예시
            include: { habits: true },
          },
          _count: {
            select: { points: true, studyEmojis: true, habitHistories: true },
          },
        },
      }),
      // 포인트 총합 노출이 필요하다면 활성화
      prisma.point.aggregate({
        where: { studyId },
        _sum: { value: true },
      }),
    ]);

    if (!detail) return null;
    return { ...detail, pointsSum: pointsAgg._sum.value ?? 0 };
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

// (그대로 사용) symbol → Emoji.id 보장
async function serviceEmojiFindOrCreate(emojiSymbol) {
  const symbol = String(emojiSymbol);

  try {
    let emoji = await prisma.emoji.findUnique({
      where: { symbol },
      select: { id: true },
    });
    if (emoji) return emoji.id;

    try {
      emoji = await prisma.emoji.create({
        data: { symbol, name: symbol },
        select: { id: true },
      });
      return emoji.id;
    } catch (err) {
      if (err.code === 'P2002') {
        const again = await prisma.emoji.findUnique({
          where: { symbol },
          select: { id: true },
        });
        if (again) return again.id;
      }
      throw err;
    }
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

// 이모지 횟수 증가 API 서비스 (시그니처/변수명 유지)
async function serviceEmojiIncrement(studyId, emojiSymbol, emojiCount) {
  const sid = Number(studyId);
  const inc = Math.max(1, Number(emojiCount) || 1);

  // 1) symbol 기반으로 Emoji.id 확보
  const eid = await serviceEmojiFindOrCreate(emojiSymbol);

  // 2) 원자적 증가 시도: 존재하는 경우에만 업데이트(경합에 강함)
  const { count: updated } = await prisma.studyEmoji.updateMany({
    where: { studyId: sid, emojiId: eid },
    data: { count: { increment: inc } },
  });

  if (updated > 0) {
    // 필요 시 갱신된 레코드 반환
    return prisma.studyEmoji.findUnique({
      where: { studyId_emojiId: { studyId: sid, emojiId: eid } },
    });
  }

  // 3) 없으면 생성 시도
  try {
    return await prisma.studyEmoji.create({
      data: {
        count: inc,
        study: { connect: { id: sid } }, // Study가 없으면 아래 catch에서 P2003
        emoji: { connect: { id: eid } }, // 이미 보장된 Emoji
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      // 4) 생성 경합(다른 요청이 먼저 생성) → 다시 증가
      return prisma.studyEmoji.update({
        where: { studyId_emojiId: { studyId: sid, emojiId: eid } },
        data: { count: { increment: inc } },
      });
    }
    if (err.code === 'P2003') {
      // FK 위반: Study가 실제로 존재하는지 확인 필요
      const e = new Error(`FK 위반(P2003): Study(${sid}) 또는 Emoji(${eid})가 존재하지 않습니다.`);
      e.code = 'FK_VIOLATION';
      throw e;
    }
    console.log(err, '가 발생했습니다.');
    throw err;
  }
}

// 이모지 횟수 감소 API 서비스
async function serviceEmojiDecrement(studyId, emojiSymbol, emojiCount) {
  const sid = Number(studyId);
  const dec = Math.max(1, Number(emojiCount) || 1);

  // 1) symbol로 Emoji "조회만" (없으면 생성하지 않음)
  const symbol = String(emojiSymbol);
  const emoji = await prisma.emoji.findUnique({
    where: { symbol },
    select: { id: true },
  });

  // 이모지 자체가 없으면 감소할 대상이 없으므로 종료
  if (!emoji) {
    return { deleted: false, studyId: sid, emojiId: null, count: 0, reason: 'emoji-not-found' };
  }

  const eid = emoji.id;

  // 2) 감소 후 최소 1 이상 남는 경우에만 원자적으로 감소
  const res = await prisma.studyEmoji.updateMany({
    where: { studyId: sid, emojiId: eid, count: { gt: dec } },
    data: { count: { decrement: dec } },
  });

  if (res.count === 1) {
    // 감소 성공 → 최신 레코드 반환
    return prisma.studyEmoji.findUnique({
      where: { studyId_emojiId: { studyId: sid, emojiId: eid } },
    });
  }

  // 3) 현재 레코드 조회 (없으면 이미 0)
  const current = await prisma.studyEmoji.findUnique({
    where: { studyId_emojiId: { studyId: sid, emojiId: eid } },
    select: { count: true },
  });

  if (!current) {
    // 해당 이모지 카운트 자체가 없었음
    return { deleted: false, studyId: sid, emojiId: eid, count: 0, reason: 'not-exists' };
  }

  // 4) 기존 count <= dec 이면 0 이하가 되므로 삭제
  const del = await prisma.studyEmoji.deleteMany({
    where: { studyId: sid, emojiId: eid, count: { lte: dec } },
  });

  if (del.count === 1) {
    return { deleted: true, studyId: sid, emojiId: eid, count: 0 };
  }

  // 동시성 등으로 이미 삭제된 케이스
  return { deleted: false, studyId: sid, emojiId: eid, count: 0, reason: 'race' };
}

export default {
  serviceGetStudy,
  serviceStudyList,
  serviceStudyCreate,
  serviceStudyUpdate,
  serviceStudyDelete,
  serviceStudyDetail,

  serviceEmojiIncrement,
  serviceEmojiDecrement
};
// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// 관리를 위한 전체 스터디 목록 조회 API 서비스
async function serviceGetStudy() {
  try {
    return await prisma.study.findMany({
      orderBy: { createdAt: 'desc' },
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
    });
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

async function serviceStudyList(options) {
  // 0) 파라미터 정규화
  const rawOffset = options.offset;
  const rawLimit = options.limit;
  const rawSort = options.sort;
  const rawIsActive = options.isActive;
  const rawKeyword = options.keyword;

  const offset =
    typeof rawOffset === 'number' &&
    Number.isInteger(rawOffset) &&
    rawOffset >= 0
      ? rawOffset
      : 0;
  const limit =
    typeof rawLimit === 'number' &&
    Number.isInteger(rawLimit) &&
    rawLimit > 0 &&
    rawLimit <= 50
      ? rawLimit
      : 6;
  const sort = typeof rawSort === 'string' ? rawSort : 'recent';

  const hasIsActive = typeof rawIsActive === 'boolean';
  const isActiveVal = hasIsActive ? rawIsActive : undefined;
  const keyword = typeof rawKeyword === 'string' ? rawKeyword : '';

  try {
    // 1) where 구성
    const studyWhere = {};
    if (hasIsActive) studyWhere.isActive = isActiveVal;
    if (keyword.trim() !== '') {
      studyWhere.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // ───────────────────────────────────────────────────
    // A. 시간 정렬: recent/old → createdAt 단일 정렬
    // ───────────────────────────────────────────────────
    if (sort === 'recent' || sort === 'old') {
      const orderBy =
        sort === 'old' ? { createdAt: 'asc' } : { createdAt: 'desc' };

      const [rows, totalCount] = await Promise.all([
        prisma.study.findMany({
          where: studyWhere,
          orderBy: [orderBy],
          skip: offset,
          take: limit < 50 ? limit : 50,
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
              orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
              take: 3,
              select: {
                count: true,
                emoji: { select: { id: true, symbol: true } },
              },
            },
          },
        }),
        prisma.study.count({ where: studyWhere }),
      ]);

      // 총합 포인트(point) 보강
      const ids = rows.map(s => s.id);
      let sumMap = new Map();
      if (ids.length > 0) {
        const sums = await prisma.point.groupBy({
          by: ['studyId'],
          where: { studyId: { in: ids } },
          _sum: { point: true },
        });
        sumMap = new Map(
          sums.map(r => {
            const val =
              r._sum && typeof r._sum.point === 'number' ? r._sum.point : 0;
            return [r.studyId, val];
          }),
        );
      }
      const enriched = rows.map(s => {
        const sum = sumMap.has(s.id) ? sumMap.get(s.id) : 0;
        return { ...s, point: sum };
      });

      return { studies: enriched, totalCount };
    }

    // ───────────────────────────────────────────────────
    // B. 포인트 정렬: points_desc/points_asc
    //    Prisma 6.15 제약으로 relation-aggregate orderBy 미지원 → groupBy 우회
    // ───────────────────────────────────────────────────
    const pointOrder = sort === 'points_asc' ? 'asc' : 'desc';

    // 1단계: 포인트가 있는 스터디를 point 합계로 정렬하여 페이지 자르기
    const page = await prisma.point.groupBy({
      by: ['studyId'],
      where: { study: studyWhere },
      _sum: { point: true },
      orderBy: { _sum: { point: pointOrder } },
      skip: offset,
      take: limit < 50 ? limit : 50,
    });
    const orderedIds = page.map(r => r.studyId);

    // 2단계: 해당 Study 조회(순서 복원)
    let groupRows = [];
    if (orderedIds.length > 0) {
      const rows = await prisma.study.findMany({
        where: { id: { in: orderedIds } }, // groupBy에 studyWhere 이미 반영됨
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
            orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
            take: 3,
            select: {
              count: true,
              emoji: { select: { id: true, symbol: true } },
            },
          },
        },
      });
      const map = new Map(rows.map(r => [r.id, r]));
      groupRows = orderedIds.map(id => map.get(id)).filter(Boolean);
    }

    // 3단계: 페이지 부족 시 포인트 0 스터디 보강(정렬 1가지만 유지 → 단순 take)
    const deficit = limit - groupRows.length;
    let fillerRows = [];
    if (deficit > 0) {
      const notIn = orderedIds.length > 0 ? { notIn: orderedIds } : undefined;
      const whereFiller = { ...studyWhere };
      if (notIn) whereFiller.id = notIn;

      fillerRows = await prisma.study.findMany({
        where: whereFiller,
        take: deficit,
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
            orderBy: [{ count: 'desc' }, { emojiId: 'asc' }],
            take: 3,
            select: {
              count: true,
              emoji: { select: { id: true, symbol: true } },
            },
          },
        },
      });
    }

    // 합치기
    let merged = groupRows.concat(fillerRows);

    // 총합 포인트 매핑
    const ids = merged.map(s => s.id);
    let sumMap = new Map();
    if (ids.length > 0) {
      const sums = await prisma.point.groupBy({
        by: ['studyId'],
        where: { studyId: { in: ids } },
        _sum: { point: true },
      });
      sumMap = new Map(
        sums.map(r => {
          const val =
            // eslint-disable-next-line no-underscore-dangle
            r._sum && typeof r._sum.point === 'number' ? r._sum.point : 0;
          return [r.studyId, val];
        }),
      );
    }
    merged = merged.map(s => {
      const sum = sumMap.has(s.id) ? sumMap.get(s.id) : 0;
      return { ...s, point: sum };
    });

    // 최종 정렬: 포인트 단일 정렬만 적용(충돌 방지)
    const dir = pointOrder === 'asc' ? 1 : -1;
    merged = merged.sort((a, b) => {
      const pa = typeof a.point === 'number' ? a.point : 0;
      const pb = typeof b.point === 'number' ? b.point : 0;
      if (pa === pb) return 0;
      return (pa - pb) * dir;
    });

    const totalCount = await prisma.study.count({ where: studyWhere });
    return { studies: merged, totalCount };
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
) {
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
        where: { id: studyId }, // 필요 시 { id: studyId, isActive: true }로 강화 가능
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
              emoji: true,
            },
            orderBy: { count: 'desc' },
          },
          habitHistories: {
            orderBy: { weekDate: 'desc' },
            take: 1,
            include: { habits: true },
          },
        },
      }),
      // ✅ 총합 포인트는 point 합계로 집계
      prisma.point.aggregate({
        where: { studyId },
        _sum: { point: true },
      }),
    ]);

    if (!detail) return null;

    // ✅ 안전 접근(?? 미사용): _sum 또는 point가 없으면 0
    const totalPoint =
      // eslint-disable-next-line no-underscore-dangle
      pointsAgg && pointsAgg._sum && typeof pointsAgg._sum.point === 'number'
        // eslint-disable-next-line no-underscore-dangle
        ? pointsAgg._sum.point
        : 0;

    // 응답 키는 총합 포인트 의미의 point로 노출
    return { ...detail, point: totalPoint };
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

async function serviceStudyVerifyPassword(studyId, password) {
  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { password: true },
    });

    if (!study) {
      const err = new Error('스터디의 비밀번호가 존재하지 않습니다.');
      err.status = 404;
      err.code = 'STUDY_PASSWORD_NOT_FOUND';
      throw err;
    }

    return await argon2.verify(study.password, password);
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

// 이모지 횟수 증가 API 서비스
async function serviceEmojiIncrement(studyId, emojiSymbol, emojiCount) {
  const sid = Number(studyId);
  const n = Number(emojiCount);
  const inc = Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;

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
      include: { emoji: { select: { symbol: true } } },
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
      const e = new Error(
        `FK 위반(P2003): Study(${sid}) 또는 Emoji(${eid})가 존재하지 않습니다.`,
      );
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
  const n = Number(emojiCount);
  const dec = Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;

  // 1) symbol로 Emoji "조회만" (없으면 생성하지 않음)
  const symbol = String(emojiSymbol);
  const emoji = await prisma.emoji.findUnique({
    where: { symbol },
    select: { id: true },
  });

  // 이모지 자체가 없으면 감소할 대상이 없으므로 종료
  if (!emoji) {
    return {
      deleted: false,
      studyId: sid,
      emojiId: null,
      count: 0,
      reason: 'emoji-not-found',
    };
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
    return {
      deleted: false,
      studyId: sid,
      emojiId: eid,
      count: 0,
      reason: 'not-exists',
    };
  }

  // 4) 기존 count <= dec 이면 0 이하가 되므로 삭제
  const del = await prisma.studyEmoji.deleteMany({
    where: { studyId: sid, emojiId: eid, count: { lte: dec } },
  });

  if (del.count === 1) {
    return { deleted: true, studyId: sid, emojiId: eid, count: 0 };
  }

  // 동시성 등으로 이미 삭제된 케이스
  return {
    deleted: false,
    studyId: sid,
    emojiId: eid,
    count: 0,
    reason: 'race',
  };
}

export default {
  serviceGetStudy,
  serviceStudyList,
  serviceStudyCreate,
  serviceStudyUpdate,
  serviceStudyDelete,
  serviceStudyDetail,
  serviceStudyVerifyPassword,

  serviceEmojiIncrement,
  serviceEmojiDecrement,
};

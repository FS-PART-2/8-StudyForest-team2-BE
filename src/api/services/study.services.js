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

// 스터디 이모지 업데이트 API 서비스
async function serviceStudyUpdateEmojis(studyId, emojiId, emoji_count) {
  try {
    return await prisma.studyEmoji.update(
      where: {
        studyId_emojiId: {
          studyId: studyId,
          emojiId: emojiId,
        }
      },
      data: { count: emoji_count },
    );
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

export default {
  serviceGetStudy,
  serviceStudyList,
  serviceStudyCreate,
  serviceStudyUpdate,
  serviceStudyDelete,
  serviceStudyDetail,

  serviceStudyUpdateEmojis
};

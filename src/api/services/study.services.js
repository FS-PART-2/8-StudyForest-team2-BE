// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

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
    return await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        studyEmojis: true,
        habitHistories: true,
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
            studyEmojis: true,
            habitHistories: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error, '가 발생했습니다.');
    throw error;
  }
}

export default {
  serviceStudyList,
  serviceStudyCreate,
  serviceStudyDelete,
  serviceStudyDetail,
};

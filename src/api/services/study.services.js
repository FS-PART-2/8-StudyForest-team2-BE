// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)
import { PrismaClient } from '@prisma/client';

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

export default { serviceStudyList };

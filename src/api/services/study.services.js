// 비즈니스 로직의 핵심(도메인 규칙, 트랜잭션, 외부 API 연동)
// 데이터 접근 계층 호출(Prisma/Mongoose/Raw SQL)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function serviceStudyList(options) {
  const { offset, keyword, pointOrder, recentOrder } = options;
  const PAGE_SIZE = 6; // 한 번에 가져올 스터디 수
  const where = { isActive: true };

  try {
    const [studies, totalCount] = await Promise.all([
      prisma.study.findMany({
        where: {
          name: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        orderBy: [
          {
            points: {
              _count: pointOrder === 'desc' ? 'desc' : 'asc',
            },
          },
          { createdAt: recentOrder === 'recent' ? 'desc' : 'asc' },
        ],
        skip: offset,
        take: PAGE_SIZE,
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

// 요청 파싱(params/query/body) + 입력 검증 결과 처리
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line import/extensions
import focusService from '../services/focus.services.js';

const prisma = new PrismaClient();

async function controlGetList(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = req.query.id;
  const studyIdResult = await prisma.study.findMany({
    where: { id: studyId },
  });
  if (!studyIdResult) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  /* 서비스 호출 */
  const focusList = await focusService.serviceGetList(studyId);

  /* 결과 반환 */
  res.status(200).json(focusList);
}

async function controlUpdateFocus(req, res) {
  /* 쿼리 파라미터 파싱 및 입력 검증 */
  const studyId = Number(req.params.studyId);
  const studyIdResult = await prisma.study.findMany({
    where: { id: studyId },
  });
  if (!studyIdResult) {
    const err = new Error('유효하지 않은 스터디 ID입니다.');
    err.status = 400;
    err.code = 'INVALID_STUDY_ID';
    throw err;
  }

  const { minuteData } = req.body;
  if (typeof minuteData !== 'number' || minuteData <= 0) {
    const err = new Error('유효하지 않은 시간 데이터입니다.');
    err.status = 400;
    err.code = 'INVALID_TIME_DATA';
    throw err;
  }

  const { secondData } = req.body;
  if (typeof secondData !== 'number' || secondData < 0) {
    const err = new Error('유효하지 않은 시간 데이터입니다.');
    err.status = 400;
    err.code = 'INVALID_TIME_DATA';
    throw err;
  }

  /* 서비스 호출 */
  const focusResult = await focusService.serviceUpdateFocus(
    studyId,
    minuteData,
    secondData,
  );

  /* 결과 반환 */
  res.status(200).json(focusResult);
}

export default {
  controlGetList,
  controlUpdateFocus,
};

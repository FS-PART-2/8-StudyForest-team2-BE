import cron from "node-cron";

async function sendPing() {
  try {
    const response = await fetch(`${process.env.SERVER_URL}`);

    if (response.ok) {
      console.log(
        `[${new Date().toISOString()}] 서버 핑 성공 (상태 코드: ${response.status})`
      );
    } else {
      // 4xx, 5xx 상태 코드인 경우
      console.log(
        `[${new Date().toISOString()}] 서버 핑 응답 이상 (상태 코드: ${response.status}, ${response.statusText})`
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] 서버 핑 실패: ${error.message}`
    );
  }
}

/**
 * 서버 핑 크론 작업 시작
 * 매 10분마다 서버 핑 요청
 */
function startCronJob() {
  cron.schedule("*/10 * * * *", () => {
    sendPing();
  });

  console.log(`[${new Date().toISOString()}] 서버 핑 시작`);
  sendPing(); // 시작 시 한 번 실행
}

export default startCronJob;

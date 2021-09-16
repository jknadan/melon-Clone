const cron = require("node-cron");
const {pool} = require("./database");
const musicDao = require("../src/app/Music/musicDao");

// 수정 작업은 백엔드L에서 주로 이루어진다. 쿼리문은 최대한 안건드는게 규칙같은.
// 매 시간 정각에 차트 갱신 쿼리 실행
// config폴더에서 따로 구현. config = 설정.

// express.js 처럼 모듈 exports를 함수로 해도 되는데 일단 함수를 만들어서 exports해봄

function chartScheduler() {

    // schedule.schedule('28 * * * *',function () {
    //
    //     console.log("cron실행");
    //
    // });
    // 매 시간 정각에 차트 업데이트
    cron.schedule('00 * * * *',async function () {

        const connection = await pool.getConnection(async (conn)=>conn);
        if(connection) console.log("connection이 살아있다")
        const updateMusicRanking_TOP100 = musicDao.updateMusicRanking(connection);
        if(updateMusicRanking_TOP100) console.log("차트 갱신 실행 준비중")
        console.log('차트 갱신 실행!');
        conncection.release();

    });

}

// 얘도 실행은 됌. 근데 주석 처리해도 왜 되냐ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ

// setInterval(function () {
//     console.log('ㅋㅋㅋㅋㅋㅋ')
// },1000)

module.exports = {
    schedule : chartScheduler
}


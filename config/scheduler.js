const cron = require("node-cron");
const {pool} = require("./database");
const musicDao = require("../src/app/Music/musicDao");
const date = require('date-utils');

// 수정 작업은 백엔드L에서 주로 이루어진다. 쿼리문은 최대한 안건드는게 규칙같은.
// 매 시간 정각에 차트 갱신 쿼리 실행
// config폴더에서 따로 구현. config = 설정.
// express.js 처럼 모듈 exports를 함수로 해도 되는데 일단 함수를 만들어서 exports해봄

function chartScheduler() {



    cron.schedule('00 * * * *',async function () {

        const connection = await pool.getConnection(async (conn)=>conn);
        if(connection) console.log("connection이 살아있다")
        const updateMusicRanking_TOP100 = musicDao.updateMusicRanking(connection);
        if(updateMusicRanking_TOP100) console.log("차트 갱신 실행 준비중")
        console.log('차트 갱신 실행!');
        conncection.release();

    });
    //
    // setInterval(function () {
    //     var Date = new Date();
    //     var time = Date.toTimeString('YYYY-MM-DD HH24:MI:SS');
    //
    //     console.log("현재 시각 : " + time);
    // },1000);

}


module.exports = {
    schedule : chartScheduler
}


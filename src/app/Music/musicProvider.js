const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const musicDao = require("./musicDao");
const musicProvider = require("./musicProvider");
const musicService = require("./musicService");
const {getAlbumInfo, getVideoInfo} = require("./musicProvider");

const {errResponse} = require("../../../config/response");
const {response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");

// Provider: Read 비즈니스 로직 처리

// exports.getMusicHistory = async function(userId){
//   const connection = await pool.getConnection(async(conn)=>conn);
//   const userMusicHistoryResult = await userDao.getMusicHistory(connection,userId);
//   connection.release();
//
//   return userMusicHistoryResult;
// }

exports.getAlbumMusic = async function(albumIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const albumMusicResult = await musicDao.selectAlbumMusic(connection,albumIdx);

    connection.release();

    return albumMusicResult;
}

exports.getAlbumInfo = async function(albumIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const albumInfoResult = await musicDao.selectAlbumInfo(connection,albumIdx);
    // console.log(albumInfoResult)
    connection.release();

    return albumInfoResult;
}

exports.getVideoInfo = async function(videoIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const getVideoResult = await musicDao.selectVideoInfo(connection,videoIdx);
    // console.log(getVideoResult)
    connection.release();

    return getVideoResult;
}

exports.getMusicInfo = async function(musicIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const musicInfoResult = await musicDao.selectMusicInfo(connection,musicIdx);
    connection.release();

    return musicInfoResult;
}

exports.getMusicByLyric = async function(keyword){
    const connection = await pool.getConnection(async (conn)=>conn);
    const searchResultByLyric = await musicDao.searchMusicInfo(connection,keyword);
    connection.release();

    return searchResultByLyric;
}

exports.getCommentInfo = async function(userId,commentIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const commentResult = await musicDao.selectUserComment(connection,userId,commentIdx);
    connection.release();

    return commentResult;
}

exports.getCommentList = async function(albumIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const commentListResult = await musicDao.selectCommentList(connection,albumIdx);
    connection.release();

    return commentListResult;
}

exports.getMusicPlaylist = async function(musicIdx,playlistIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const checkResult = await musicDao.checkMusicPlaylist(connection,musicIdx,playlistIdx);
    connection.release();

    return checkResult;
}

exports.checkPlaylist = async function(playlistIdx,userId){
    const connection = await pool.getConnection(async (conn)=>conn);
    const checkResult = await musicDao.checkPlaylist(connection,playlistIdx,userId);
    connection.release();

    return checkResult;
}

exports.getMusicLikeList = async function(userId,musicIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const checkResult = await musicDao.checkMusicLike(connection,userId,musicIdx);
    connection.release();

    return checkResult;
}

exports.getMusicianList = async function(musicianIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const checkResult = await musicDao.getMusicianList(connection,musicianIdx);
    connection.release();

    return checkResult;
}

exports.getTimeline = async function(musicianIdx){

    const checkMusician = await exports.getMusicianList(musicianIdx);
    // console.log(checkMusician[0])
    if(checkMusician[0] === undefined){
        return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);
    }
// 이럴경우에는...type를 어떻게 표시해줘야할까?
    try{

        // 결과를 받아올 타임라인 Array
        let timelineResult = [0];

        const connection = await pool.getConnection(async (conn)=>conn);
        const timelineInfo = await musicDao.getTimeline(connection,musicianIdx);
        // console.log(timelineInfo.length);
        connection.release();

        for(let i=0; i<timelineInfo.length;i++){
            if(timelineInfo[i].type === 'Album'){

                let temp = await exports.getAlbumInfo(timelineInfo[i].idx);
                timelineResult[i] = temp[0];
                // console.log(timelineInfo[i].idx);
            }else{

                let temp = await exports.getVideoInfo(timelineInfo[i].idx);
                timelineResult[i] = temp[0];
                // console.log(timelineResult);
            }
            // "type" = 선언
            timelineResult[i]["type"] = timelineInfo[i].type;
        }
        // 현재까진 3차원 배열로 진행 , 2차원 배열이나 올바른 배열로
        console.log(timelineResult);
        return timelineResult;
    }catch (err){
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }

}

exports.getPlaylistInfo = async function(playlistIdx,userId){

    // 플레이리스트 존재 체크
    const isExistPlaylist = await musicProvider.checkPlaylist(playlistIdx,userId);
    console.log(typeof userId)
    // console.log(isExistPlaylist[0]);
    if(isExistPlaylist[0] === undefined) return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);

    const connection = await pool.getConnection(async (conn)=>conn);
    const playlistInfoResult = await musicDao.getPlaylistInfo(connection,playlistIdx);
    const playlistMusicResult = await musicDao.getPlaylistMusic(connection,playlistIdx);

    connection.release();
// Object.assign말고 다른거 하자
    playlistInfoResult[0]["list"] = playlistMusicResult;
    console.log(playlistInfoResult[0].list[0].title)
    // Object.assign(playlistInfoResult,playlistMusicResult);
    // console.log(result);

    return playlistInfoResult;

}

exports.getPlayMusicInfo = async function(playlistIdx,musicIdx,userId){

    try{

        // 플레이리스트 존재 체크
        // 주석은 설명이 필요할 거 같은 코드에 주석을 하자. 한줄에 최대한 깔끔하고 간결.
        const isExistPlaylist = await musicProvider.checkPlaylist(playlistIdx,userId);
        console.log(isExistPlaylist[0]);
        if(isExistPlaylist[0] === undefined) return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);

        // 플레이 리스트 내부 음악 체크

        const isExistCheck = await musicProvider.getMusicPlaylist(musicIdx,playlistIdx);
        // console.log(isExistCheck)
        if(isExistCheck === undefined){
            return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);
        } else{
            const connection = await pool.getConnection(async (conn)=> conn);

            const playMusicInfoResult = await musicDao.getPlayMusicInfo(connection,playlistIdx,musicIdx);
            // console.log(playMusicInfoResult);
            console.log("userId = " + userId);
            const insertMusicHistory = await musicService.insertMusicHistory(userId,musicIdx);
            console.log("기록 완료");

            connection.release();
            return playMusicInfoResult;
        }


    }catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }


}

exports.getChartInfo = async function(page,pageSize){
    const connection = await pool.getConnection(async (conn)=>conn);

    try{
        var start = 0;
        // 차트 길이를 알기 위한 임시 쿼리
        const tempChartResult = await musicDao.chartLength(connection);
        if(page > Math.round(tempChartResult[0].cnt/pageSize)){
            page = Math.round(tempChartResult[0].cnt/pageSize); // 마지막 페이지 이상을 넘어서면 가장 마지막 페이지를 보여주도록 설계
        }
        if(page<=0){
            page = 1;
        }
        else{
            start = (page-1) * pageSize;
        }

        console.log(page)
        console.log(tempChartResult[0].cnt/pageSize);

        console.log("start : " + start + " pageSize : " + pageSize);
        // mySql에서 Limit 는 다른 조건들과 달리 String의 데이터를 읽지 못한다. 그래서 Number()로 형변환을 해주어서 넣어줌
        const getChartResult = await musicDao.getChartInfo(connection,Number(start),Number(pageSize));
        return getChartResult;
    }catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }


}

exports.getChartInfoCursor = async function(page,pageSize){
    const connection = await pool.getConnection(async (conn)=>conn);

    try{
        var start = 0;
        // 차트 길이를 알기 위한 임시 쿼리
        const tempChartResult = await musicDao.chartLength(connection);
        if(page > Math.round(tempChartResult[0].cnt/pageSize)){
            page = Math.round(tempChartResult[0].cnt/pageSize); // 마지막 페이지 이상을 넘어서면 가장 마지막 페이지를 보여주도록 설계
        }
        if(page<=0){
            page = 1;
        }
        else{
            start = (page-1) * pageSize;
        }

        console.log(page)
        console.log(tempChartResult[0].cnt/pageSize);

        console.log("start : " + start + " pageSize : " + pageSize);
        // mySql에서 Limit 는 다른 조건들과 달리 String의 데이터를 읽지 못한다. 그래서 Number()로 형변환을 해주어서 넣어줌
        const getChartResult = await musicDao.getChartInfoCursor(connection,Number(start),Number(pageSize));
        return getChartResult;
    }catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }


}

exports.getMusicianCheck = async function(userIdFromJWT){
    const connection = await pool.getConnection(async (conn)=> conn);

    const getMusicianResult = await musicDao.getMusicianCheck(connection,userId);
    return getMusicianResult;
}


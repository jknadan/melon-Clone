const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const musicDao = require("./musicDao");
const musicProvider = require("./musicProvider");
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

exports.checkPlaylist = async function(playlistIdx){
    const connection = await pool.getConnection(async (conn)=>conn);
    const checkResult = await musicDao.checkPlaylist(connection,playlistIdx);
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

exports.getPlaylistInfo = async function(playlistIdx){

    // 플레이리스트 중복 체크
    const isExistPlaylist = await musicProvider.checkPlaylist(playlistIdx);
    console.log(isExistPlaylist[0]);
    if(isExistPlaylist[0] === undefined) return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);

    const connection = await pool.getConnection(async (conn)=>conn);
    const playlistInfoResult = await musicDao.getPlaylistInfo(connection,playlistIdx);
    const playlistMusicResult = await musicDao.getPlaylistMusic(connection,playlistIdx);

    connection.release();
// Object.assign말고 다른거 하자
    const result = Object.assign(playlistInfoResult,playlistMusicResult);

    return result;

}


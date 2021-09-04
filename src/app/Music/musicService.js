const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const musicProvider = require("./musicProvider");
const musicDao = require("./musicDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.updateMusicInfo = async function(musicIdx,title,lyric){

    const connection = await pool.getConnection(async (conn)=>conn);

    const isMusic = await musicDao.selectMusicInfo(connection,musicIdx);

    console.log(isMusic)
    // Validation 실패 isMusic이 [] 이라면 null이 아닌가?
    if(isMusic == null) {
        logger.error(`App - editMusicInfo Service error\n: ${err.message}`);
        return response(baseResponse.DB_ERROR)
    }else{
        const musicInfoResult = await musicDao.updateMusicInfo(connection,musicIdx,title,lyric);
        connection.release();

        return response(baseResponse.SUCCESS);
    }

}

exports.deleteMusic= async function(musicIdx){

    const connection = await pool.getConnection(async (conn)=>conn);
    const deleteMusicResult = await musicDao.deleteMusic(connection,musicIdx);
    connection.release();

    return deleteMusicResult;
}

exports.postComment = async function(userId,albumIdx,contents){

    const connection = await pool.getConnection(async (conn)=>conn);
    const postCommentResult = await musicDao.insertAlbumComment(connection,userId,albumIdx,contents);
    connection.release();

    return postCommentResult;
}

exports.updateComment = async function(userId,commentIdx,contents){
    const connection = await pool.getConnection(async (conn)=>conn);

    // Validation : 유저가 작성한 댓글이 일단 Comment 테이블에 존재하는지 여부 판단
    const userComment = await musicProvider.getCommentInfo(userId,commentIdx);
    console.log(userComment[0]);
    if(userComment[0] === undefined){
        return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);
    }
    else {
        const updateCommentResult = await musicDao.updateAlbumComment(connection, userId, commentIdx, contents);

        connection.release();
        return response(baseResponse.SUCCESS,updateCommentResult);
    }
}

exports.insertMusicPL = async function(musicIdx,playlistIdx){


         //음악 중복 체크
        const isExistCheck = await musicProvider.getMusicPlaylist(musicIdx,playlistIdx);
        // console.log(isExistCheck)

        if(isExistCheck !== undefined) {
            return response(errResponse(baseResponse.MUSIC_ALREADY_EXIST))
        }else{
            const connection = await pool.getConnection(async (conn)=>conn);

            const insertMusicResult = await musicDao.insertMusicPlaylist(connection,musicIdx,playlistIdx);
            return response(baseResponse.SUCCESS);
        }

}

exports.addMusicLike = async function(userId,musicIdx){

try{
    const isExistCheck = await musicProvider.getMusicLikeList(userId,musicIdx);
    console.log(isExistCheck);
    if(isExistCheck !== undefined){
        return response(errResponse(baseResponse.MUSIC_ALREADY_EXIST))
    }else{
        const connection = await pool.getConnection(async (conn)=>conn);
        const addMusicLike = await musicDao.insertMusicLike(connection,userId,musicIdx);

        return response(baseResponse.SUCCESS);
    }
}catch (err) {
    return errResponse(baseResponse.DB_ERROR);
}


}
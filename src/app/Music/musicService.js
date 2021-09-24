const {logger} = require("../../../config/winston"); // 디버그 중 로그 출력
const {pool} = require("../../../config/database"); // DB연결
const secret_config = require("../../../config/secret"); // JWT 시크릿 키
const musicProvider = require("./musicProvider"); // Provider에서 값을 가져와야함'
const userProvider = require("../User/userProvider");
const musicDao = require("./musicDao"); // MUSIC 관련 DB
const baseResponse = require("../../../config/baseResponseStatus"); // RESPONSE
const {response} = require("../../../config/response"); // RESPONSE
const {errResponse} = require("../../../config/response"); // RESPONSE
const cron = require('node-cron')

const jwt = require("jsonwebtoken");
const crypto = require("crypto"); //비밀번호 인코더 디코더
const {connect} = require("http2");//..?



// Service: Create, Update, Delete 비즈니스 로직 처리

exports.updateMusicInfo = async function(userIdFromJWT,musicIdx,title,lyric){

    const connection = await pool.getConnection(async (conn)=>conn);

    try{

        await connection.beginTransaction();

        const checkMusic = await musicProvider.getMusicInfo(musicIdx);

        // console.log(checkMusic[0])
        // [] 이라면 null이 아닌가?
        if(checkMusic[0] === undefined) {
            return response(baseResponse.CONTENT_RESULT_NOT_EXIST)
        }else{

            const userStatusCheck = await userProvider.getUserInfo(userIdFromJWT);
            const userMusicianCheck = await userProvider.getMusicianCheck(userIdFromJWT);


            if(userStatusCheck[0].status !== 4)
                return errResponse(baseResponse.MUSICIAN_MUSICIANID_NOT_EXIST);



            // if(!(userMusicianCheck.includes(musicIdx))){
            //     console.log("해당 음원은 뮤지션의 발매곡들 중 하나임")
            // }
            const musicInfoResult = await musicDao.updateMusicInfo(connection,musicIdx,title,lyric);
            await connection.commit();
            connection.release();

            return response(baseResponse.SUCCESS);

        }

    }catch (err) {

        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }

}

exports.deleteMusic= async function(musicIdx){

    const connection = await pool.getConnection(async (conn)=>conn);

    try{
        await connection.beginTransaction();
        const deleteMusicResult = await musicDao.deleteMusic(connection,musicIdx);
        await connection.commit();
        connection.release();

        return deleteMusicResult;

    }catch (err){
        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.postComment = async function(userId,albumIdx,contents){

    const connection = await pool.getConnection(async (conn)=>conn);
    try{
        await connection.beginTransaction();

        const postCommentResult = await musicDao.insertAlbumComment(connection,userId,albumIdx,contents);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);

    }catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.updateComment = async function(userId,commentIdx,contents){


    const connection = await pool.getConnection(async (conn)=>conn);
    try{
        await connection.beginTransaction();

        // Validation : 유저가 작성한 댓글이 일단 Comment 테이블에 존재하는지 여부 판단
        const userComment = await musicProvider.getCommentInfo(userId,commentIdx);
        console.log(userComment[0]);
        if(userComment[0] === undefined){
            return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);
        }
        else {
            const updateCommentResult = await musicDao.updateAlbumComment(connection, userId, commentIdx, contents);
            await connection.commit();
            connection.release();

            return response(baseResponse.SUCCESS);
        }
    }catch (err){
        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }

}

exports.insertMusicPL = async function(musicIdx,playlistIdx){

    const connection = await pool.getConnection(async (conn)=>conn);

    try{
        await connection.beginTransaction();

        //Vaildation

        // 플레이리스트 중복 체크
        const isExistPlaylist = await musicProvider.checkPlaylist(playlistIdx);
        console.log(isExistPlaylist[0]);

        if(isExistPlaylist[0] === undefined) return errResponse(baseResponse.CONTENT_RESULT_NOT_EXIST);

        //음악 중복 체크
        const isExistCheck = await musicProvider.getMusicPlaylist(musicIdx,playlistIdx);
        console.log(isExistCheck)

        if(isExistCheck !== undefined) {
            return response(errResponse(baseResponse.MUSIC_ALREADY_EXIST))
        }else{
            const insertMusicResult = await musicDao.insertMusicPlaylist(connection,musicIdx,playlistIdx);
            await connection.commit();
            connection.release();
            return response(baseResponse.SUCCESS);
        }

    }catch (err){
        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }


}

exports.addMusicLike = async function(userId,musicIdx){

    const connection = await pool.getConnection(async (conn)=>conn);

try{
    await connection.beginTransaction();
    const isExistCheck = await musicProvider.getMusicLikeList(userId,musicIdx);
    console.log(isExistCheck);
    if(isExistCheck !== undefined){
        return response(errResponse(baseResponse.LIKE_ALREADY_EXIST))
    }else{

        const addMusicLike = await musicDao.insertMusicLike(connection,userId,musicIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);
    }
}catch (err) {
    logger.error(`App - editUser Service error\n: ${err.message}`);
    connection.rollback();
    if(connection.rollback()) console.log("쿼리 rollback함");
    return errResponse(baseResponse.DB_ERROR);
    }
}

exports.insertMusicHistory = async function(userId,musicIdx){

    const connection = await pool.getConnection(async (conn)=>conn);
    try{
        await connection.beginTransaction();

        console.log("On service, userId = " + userId);
        const insertHistory = await musicDao.insertMusicHistory(connection,userId,musicIdx);
        await connection.commit();
        connection.release();

        return response(baseResponse.SUCCESS);

    }catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        connection.rollback();
        if(connection.rollback()) console.log("쿼리 rollback함");
        return errResponse(baseResponse.DB_ERROR);
    }


}
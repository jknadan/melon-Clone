const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");
const {errResponse} = require("../../../config/response");
const {response} = require("../../../config/response");
const baseResponse = require("../../../config/baseResponseStatus");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.searchUserID = async function (email){
  const connection = await pool.getConnection((async (conn)=> conn));

  // const userInfoRows = await userProvider.accountCheck(email);
  //
  // if (userInfoRows[0].status === "INACTIVE") {
  //     return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
  // } else if (userInfoRows[0].status === "DELETED") {
  //     return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
  // }
  const userSearchIdResult = await exports.accountCheck(email);
  // await userDao.searchUserID(connection,email);
  connection.release();

  return userSearchIdResult;
}


exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();
  if(userResult[0]===undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);

  return response(baseResponse.SUCCESS,userResult[0]) ;
};
// // TEST
// exports.retrieveSpeUser = async function (userId) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const userResult = await userDao.selectSpeUser(connection, userId);
//
//   connection.release();
//
//   return userResult[0];
// };

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release(); // 반드시 해야함. connection 생성 후에는 정리를 해줘야함. 갯수 한계가 있음

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult;
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  console.log(userAccountResult)
  connection.release();

  return userAccountResult;
};

exports.getComment = async function(userId){

  const connection = await pool.getConnection(async (conn)=>conn);

  try{

    await connection.beginTransaction();

    //Vaildation : 회원 존재 확인
    const isExistUser = await exports.retrieveUser(userId);
    if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);

    const userCommentResult = await userDao.selectUserComment(connection,userId);

    await connection.commit();

    connection.release();

    return userCommentResult;

  }catch (err) {
    logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
    await connection.rollback();
    return errResponse(baseResponse.DB_ERROR);
  }



}

exports.getUserPlaylist = async function(userId){

  const connection = await pool.getConnection(async (conn)=>conn);
  try{

    await connection.beginTransaction();

    //Vaildation : 회원 존재 확인
    const isExistUser = await exports.retrieveUser(userId);
    if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);


    const userPlaylistResult = await userDao.selectUserPlaylist(connection,userId);
    await connection.commit();
    connection.release();

    return userPlaylistResult;
  }catch (err) {
    logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
    await connection.rollback();
    return errResponse(baseResponse.DB_ERROR);
  }

}

exports.getLikeMusic = async function(userId){

  const connection = await pool.getConnection(async (conn)=>conn);
  // console.log(connection);
  try{

    await connection.beginTransaction();
    //Vaildation : 회원 존재 확인
    const isExistUser = await exports.retrieveUser(userId);
    if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);



    const userLikeMusicResult = await userDao.selectUserLike(connection,userId);
    await connection.commit();
    if(connection.commit()) {

      console.log("쿼리 commit 됨.");
      console.log(connection.commit());

    }
    connection.release();
    if(connection.release()) console.log("connection.release 됨")
    // console.log(connection);

    return userLikeMusicResult;
  }catch (err) {
    logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
    await connection.rollback();
    if(connection.rollback) {
      console.log("쿼리 롤백 됨.");
      console.log(connection.rollback());
    }
    return errResponse(baseResponse.DB_ERROR);
  }
}

exports.getMusicHistory = async function(userId){

  //Vaildation : 회원 존재 확인
  const isExistUser = await exports.retrieveUser(userId);
  if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);

  const connection = await pool.getConnection(async(conn)=>conn);
  const userMusicHistoryResult = await userDao.getMusicHistory(connection,userId);
  connection.release();

  return userMusicHistoryResult;
}

exports.selectUserAge = async function(userId){

  //Vaildation : 회원 존재 확인
  const isExistUser = await exports.retrieveUser(userId);
  if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);


  const connection = await pool.getConnection(async (conn)=>conn);
  const userAgeResult = await userDao.selecteUserAge(connection,userId);
  connection.release();

  return userAgeResult[0].age
}


exports.getFanList = async function(userId){

  //Vaildation : 회원 존재 확인
  const isExistUser = await exports.retrieveUser(userId);
  if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);

  const connection = await pool.getConnection(async (conn)=>conn);
  const fanListResult = await userDao.selectFanList(connection,userId);
  connection.release();

  return fanListResult;
}

exports.getUserInfo = async function(userIdFromJWT){

  const connection = await pool.getConnection(async (conn) => conn);

  const checkStatus = await userDao.getUserStatus(connection,userIdFromJWT);
  connection.release();

  return checkStatus;
}

exports.getMusicianCheck = async function(userIdFromJWT) {
  const connection = await pool.getConnection(async (conn)=>conn);

  const musicianCheck = await userDao.getMusicianCheck(connection,userIdFromJWT);
  connection.release();

  return musicianCheck;
}
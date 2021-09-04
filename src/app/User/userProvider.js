const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

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


exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
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
  connection.release();

  return userAccountResult;
};

exports.getComment = async function(userId){

  const connection = await pool.getConnection(async (conn)=>conn);
  const userCommentResult = await userDao.selectUserComment(connection,userId);
  connection.release();

  return userCommentResult;
}

exports.getPlaylist = async function(userId){

  const connection = await pool.getConnection(async (conn)=>conn);
  const userPlaylistResult = await userDao.selectUserPlaylist(connection,userId);
  connection.release();

  return userPlaylistResult;
}

exports.getLikeMusic = async function(userId){
  const connection = await pool.getConnection(async (conn)=>conn);
  const userLikeMusicResult = await userDao.selectUserLike(connection,userId);
  connection.release();

  return userLikeMusicResult;
}

exports.getMusicHistory = async function(userId){
  const connection = await pool.getConnection(async(conn)=>conn);
  const userMusicHistoryResult = await userDao.getMusicHistory(connection,userId);
  connection.release();

  return userMusicHistoryResult;
}

exports.selectUserAge = async function(userId){
  const connection = await pool.getConnection(async (conn)=>conn);
  const userAgeResult = await userDao.selecteUserAge(connection,userId);
  connection.release();

  return userAgeResult[0].age
}


exports.getFanList = async function(userId){
  const connection = await pool.getConnection(async (conn)=>conn);
  const fanListResult = await userDao.selectFanList(connection,userId);
  connection.release();

  return fanListResult;
}
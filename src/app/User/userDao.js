// 모든 유저 조회
const {use} = require("express/lib/router");

async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT name,
                ID,
                age,
                sex,
                profileImage,
                introduction,
                date_format(createdAt, '%y년 %m월 %d일') as createdAt 
                FROM User
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}
//
// // 특정 유저 조회 TEST
// async function selectSpeUser(connection,userId) {
//   const selectUserListQuery = `
//                 SELECT name, ID, age, introduction, profileImage
//                 FROM User
//                 WHERE userId = ?;
//                 `;
//   const [userRows] = await connection.query(selectUserListQuery, userId);
//   return userRows;
// }

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT email, ID, name
                FROM User 
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT id, email, name 
                 FROM User
                 WHERE userId = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(email, PW, name, ID, age, sex)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email, name, PW
        FROM User 
        WHERE email = ? AND PW = ?;`;
  const [selectUserPasswordRow] = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, ID, userId
        FROM User
        WHERE email = ?;`;
  const [selectUserAccountRow] = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow;
}

// async function updateUserInfo(connection, ID, name) {
//   const updateUserQuery = `
//   UPDATE UserInfo
//   SET name = ?
//   WHERE id = ?;`;
//   const updateUserRow = await connection.query(updateUserQuery, [name, ID]);
//   return updateUserRow[0];
// }

async function deleteUserAccount(connection,userId) {
  const deleteUserQuery = `
  UPDATE User 
  SET status = '0'
  WHERE userId = ?;
  `; // 회원탈퇴 시에는 아예 컬럼을 삭제하는게 아니라 User의 status를 0으로 바꿔줌 0: 탈퇴 1: 활성화
  // 쿼리를 만들었으니까 전달해줘야지
  const deleteUserRow = await connection.query(deleteUserQuery, userId);
  return deleteUserRow;
}

async function searchUserID(connection,email){
  const searchUserIdQuery = `
  SELECT ID 
  FROM User
  WHERE email = ?; 
  `
  const [userIdResultRows] = await connection.query(searchUserIdQuery,email)
  return userIdResultRows[0];

}

async function selectUserComment(connection,userId){
  const getCommentByUserIdQuery = `
  select contents, 
  count(CL.commentIdx) as likeCnt from Comment
  inner join CommentLike CL on Comment.commentIdx = CL.commentIdx
  inner join User U on Comment.userId = U.userId
  where U.userId = ? AND U.status = '1'
  group by Comment.commentIdx;
  `;
  const [userCommentRows] = await connection.query(getCommentByUserIdQuery,userId);
  return userCommentRows;
}

async function selectUserPlaylist(connection,userId){
  const getPlaylistByUserIdQuery = `
  select playListImgUrl,playListTitle,U.profileImage,U.name from PlayLsit
    inner join User U on PlayLsit.userId = U.userId
    where PlayLsit.userId = ? AND U.status = '1';
  `;
  const [userPlaylistRows] = await connection.query(getPlaylistByUserIdQuery,userId);
  return userPlaylistRows;
}

async function selectUserLike(connection,userId){
  const getLikeByUserIdQuery = `
  select musicIdx from userMusicLike where userId = ?;
  `;
  const [userLikeRows] = await connection.query(getLikeByUserIdQuery,userId);
  return userLikeRows;
}

async function getMusicHistory(connection,userId){
  const getMusicHistory = `
  select musicIdx,DATE_FORMAT(updatedAt, '%y년 %m월 %d일 %T') as time from Streaming where userId = ? order by updatedAt desc;
  `;
  const [userMusicHistoryRows] = await connection.query(getMusicHistory,userId);
  return userMusicHistoryRows;
}

async function updateUserInfo(connection,name,age,userId){
  const updateUserQuery = `
  UPDATE User 
  SET name = ?,
  age = ?
  WHERE userId =?;
  `;
  const updateUserQueryRows = await connection.query(updateUserQuery,[name,age,userId]);
  return updateUserQueryRows;
}

async function selecteUserAge(connection,userId){
  const selectUserAgeQuery = `
  select age 
  from User 
  WHERE userId = ?
  ;`;
  const [UserAgeRows] = await connection.query(selectUserAgeQuery,userId);
  return UserAgeRows;
}

async function updateID(connection,id,userId){
  const updateIdQuery = `
  UPDATE User
  SET ID = ?
  where userId = ? AND status = '1'
  ;`;
  const updateIdRows = await connection.query(updateIdQuery,[id,userId]); // 쿼리에 여러 데이터를 파라미터로 넘겨줄땐 [] 묶기
  return updateIdRows;
}

async function selectFanList(connection,userId) {
  const getFanListQuery = `
    select musicianName,
    profileImage 
    from Singer
    inner join Fan F on Singer.musicianIdx = F.musicianIdx
    where F.userId = ?;
    `;
  const [fanListRows] = await connection.query(getFanListQuery,userId);
  return fanListRows;
}

async function getUserStatus(connection,userId){
  const getUserStatus = `
  select status from User where userId = ?;
  `;

  const [statusRows] = await connection.query(getUserStatus,userId);
  return statusRows;
}

async function getMusicianCheck(connection,userId) {
  const selectMusicianStatus = `
    select musicIdx,title from Music
    inner join Singer S on Music.musicianIdx = S.musicianIdx
    where S.userId = ?;
    ;`;

  const [musicianCheckRows] = await connection.query(selectMusicianStatus,userId);
  return musicianCheckRows;
}

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  // selectSpeUser,
  deleteUserAccount,
  searchUserID,
  selectUserComment,
  selectUserPlaylist,
  selectUserLike,
  getMusicHistory,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  updateUserInfo,
  selecteUserAge,
  updateID,
  selectFanList,
  getUserStatus,
  getMusicianCheck
};

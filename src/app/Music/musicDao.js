// 모든 유저 조회
const {use} = require("express/lib/router");
const {errResponse} = require("../../../config/response");

// async function selectUser(connection) {
//   const selectUserListQuery = `
//                 SELECT email, name
//                 FROM User;
//                 `;
//   const [userRows] = await connection.query(selectUserListQuery);
//   return userRows;
// }

async function selectAlbumMusic(connection,albumIdx){
    const selectAlbumMusicQuery = `
    select musicIdx,
    Album.title,
    musicianName,
    thumbImage,
    time_format(sec_to_time(length), '%i분%s초') as length from Album
    inner join Music M on Album.albumIdx = M.albumIdx
    where Album.albumIdx = ? and M.status = '1';
    `;

    const [musicRows] = await connection.query(selectAlbumMusicQuery,albumIdx);
    return musicRows;

}

async function selectAlbumInfo(connection, albumIdx){
    const getAlbumInfoQuery = `
    select Album.title,
    albumImgUri,
    musicianName, 
    DATE_FORMAT(Album.createdAt, '%y년 %m월 %d일') as publishing, count(M.musicIdx) as cnt from Album
    
        inner join Music M on Album.albumIdx = M.albumIdx
    
    where Album.albumIdx = ? AND Album.status = '1';
    `;
    const [albumInfoRows] = await connection.query(getAlbumInfoQuery,albumIdx);
    return albumInfoRows;
}

async function selectMusicInfo(connection, musicIdx){
    const getMusicInfoQuery = `
    select thumbImage,
    title,
    S.musicianName,
    time_format(sec_to_time(length), '%i분%s초') as length,
    lyric,
    DATE_FORMAT(Music.createdAt, '%Y %M %D') as publishing 
    from Music
       
        inner join Singer S on Music.musicianIdx = S.musicianIdx
            
    where musicIdx = ? AND Music.status = '1';
    `;
    const [musicInfoRows] = await connection.query(getMusicInfoQuery,musicIdx);
    return musicInfoRows;
}

async function searchMusicInfo(connection,keyword){


    const searchKeywordQuery = `
    select thumbImage,title,S.musicianName,time_format(sec_to_time(length), '%i분%s초') as length,
    DATE_FORMAT(Music.createdAt, '%y년 %m월 %d일') as publishing 
    from Music
    
        inner join Singer S on Music.musicianIdx = S.musicianIdx
    
    where Music.status = '1'  AND lyric like ?
    ;`;

    const [searchResultRows] = await connection.query(searchKeywordQuery,[keyword]); // 쿼리 전달시,,, 데이터 형식...?
    return searchResultRows;

}

async function updateMusicInfo(connection,musicIdx,title,lyric) {
    const editMusicInfoQuery = `
    update Music 
    SET title = ?, 
    lyric = ? 
    where musicIdx = ?;
    ;`;

    const editMusicRows = connection.query(editMusicInfoQuery,[title,lyric,musicIdx]);
    return editMusicRows;
}

async function deleteMusic(connection,musicIdx) {
    const deleteMusicQuery = `
    UPDATE Music 
    SET status = '0' 
    WHERE musicIdx = ?
    ;`;

    const deleteMusicRows = await connection.query(deleteMusicQuery,musicIdx);
    return deleteMusicRows;

}

async function insertAlbumComment(connection,userId,albumIdx,contents) {
    const insertCommentQuery = `
    INSERT INTO 
    Comment(contents,userId,albumIdx) 
    VALUES (?,?,?);
    ;`;

    const insertCommentRows = await connection.query(insertCommentQuery,[contents,userId,albumIdx]);
    return insertCommentRows;
}

async function selectUserComment(connection,userId,commentIdx){
    const selectCommentQuery = `
    SELECT * 
    FROM Comment 
    WHERE commentIdx = ? AND userId = ? AND status = '1';
    ;`;
    const [commentResultRows] = await connection.query(selectCommentQuery,[commentIdx,userId]);
    return commentResultRows;
}

async function updateAlbumComment(connection,userId,commentIdx,contents) {
    const updateCommentQuery = `
    UPDATE Comment 
    SET contents = ? 
    WHERE userId = ? AND commentIdx = ? AND status = '1';
    ;`;

    const updateCommentRows = await connection.query(updateCommentQuery,[contents,userId,commentIdx]);
    return updateCommentRows;
}

async function selectCommentList(connection,albumIdx){

    const selectCommentQuery = `
    SELECT Comment.userId,ID,profileImage,name,contents 
    FROM Comment
    INNER JOIN User U on Comment.userId = U.userId
    WHERE albumIdx= ? and Comment.status='1';
    ;`;

    const [getCommentRows] = await connection.query(selectCommentQuery,albumIdx);
    return getCommentRows;

}

async function insertMusicPlaylist(connection,musicIdx,playlistIdx) {

    const insertMusicQuery = `
    INSERT INTO musicPlaylist(playListIdx,musicIdx,status) 
    values (?,?,'1');
    ;`;

    const insertMusicRows = await connection.query(insertMusicQuery,[playlistIdx,musicIdx]);
    return insertMusicRows;
}

async function checkPlaylist(connection,musicIdx,playlistIdx) {
    const checkPlaylistQuery = `
    select * 
    from musicPlaylist 
    where musicIdx = ? 
        and playlistIdx = ? 
        and status = '1';
    ;`;

    const [checkResultRows] = await connection.query(checkPlaylistQuery,[musicIdx,playlistIdx]);
    return checkResultRows[0];

}

async function checkMusicLike(connection,userId,musicIdx) {
    const checkMusicLikeListQuery =  `
    select * 
    from userMusicLike 
    where musicIdx = ? 
        and userId = ? 
        and status = '1';
    `;

    const [checkResultRows] = await connection.query(checkMusicLikeListQuery,[musicIdx,userId]);
    return checkResultRows[0];
}

async function insertMusicLike(connection,userId,musicIdx) {

       const insertMusicLikeQuery = `
        INSERT INTO userMusicLike(userId,musicIdx) 
        values (?,?);
        ;`;

       const resultRows = await connection.query(insertMusicLikeQuery,[userId,musicIdx]);
       return resultRows
}

async function getTimeline(connection,musicianIdx) {
    const getTimelineInfoQuery = `
    SELECT Album.albumIdx as idx,
    Album.title,
    'Album' as type,
    date_format(createdAt, '%y년 %m월 %d일') as createdAt 
    FROM Album
        WHERE Album.musicianIdx = ?
    UNION ALL
    SELECT Video.videoIdx,
    title,'Video',
    date_format(createdAt, '%y년 %m월 %d일') as createdAt 
    FROM Video
        WHERE musicianIdx = ?
    ORDER BY createdAt desc;
    `;

    const [resultRows] = await connection.query(getTimelineInfoQuery,[musicianIdx,musicianIdx]);
    return resultRows;
}

async function selectVideoInfo(connection,videoIdx) {
    const selectVideoInfoQuery = `
    SELECT videoThumbnail,
    title,
    time_format(sec_to_time(videoLength), '%i분%s초') as length,
    musicianName,
    date_format(createdAt, '%y년 %m월 %d일') as createdAt 
    FROM Video 
        WHERE videoIdx = ?;
    `;
    const [videoInfoRows] = await connection.query(selectVideoInfoQuery,videoIdx);
    return videoInfoRows;
}

async function getMusicianList(connection,musician) {
    const chekMusicianQuery = `
    SELECT * 
    FROM Singer 
    WHERE musicianIdx = ?;
    ;`;
    const [musicianRows] = await connection.query(chekMusicianQuery,musician);

    return musicianRows;
}

module.exports = {
    selectAlbumMusic,
    selectAlbumInfo,
    selectMusicInfo,
    searchMusicInfo,
    updateMusicInfo,
    deleteMusic,
    insertAlbumComment,
    updateAlbumComment,
    selectUserComment,
    selectCommentList,
    insertMusicPlaylist,
    checkPlaylist,
    checkMusicLike,
    insertMusicLike,
    getTimeline,
    selectVideoInfo,
    getMusicianList
};
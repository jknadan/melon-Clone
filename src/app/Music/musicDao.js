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
    DATE_FORMAT(Music.createdAt, '%y년 %m월 %d일') as publishing,
    lyric
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
    `;

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

async function checkMusicPlaylist(connection,musicIdx,playlistIdx) {
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
// 특정 유저가 개인으로 생성한 플리. DJ 등 공개적으로 설정한 플리들은 따로 설정하자
async function checkPlaylist(connection,playlistIdx,userId) {
    const checkPlaylistQuery = `
    select *
    from PlayLsit 
    where playListIdx = ? AND userId = ?;
    ;`;

    const [checkResultRows] = await connection.query(checkPlaylistQuery,[playlistIdx,userId]);
    return checkResultRows;
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

async function getPlaylistInfo(connection,playlistIdx) {
    const getPlaylistInfoQuery = `
    select playListImgUrl,playListTitle,U.profileImage,U.name, count(uPL.userId) as follow from PlayLsit
    inner join User U on PlayLsit.userId = U.userId
    inner join userPlayList uPL on PlayLsit.playListIdx = uPL.playListIdx
    where PlayLsit.playListIdx = ? AND PlayLsit.status = '1';
    ;`;

    const [playlistInfoRows] = await connection.query(getPlaylistInfoQuery,playlistIdx);
    return playlistInfoRows;
}
async function getPlaylistMusic(connection,playlistIdx) {
    const playlistMusicListQuery = `
    select title,thumbImage,S.musicianName,
       (select count(userId) as cnt from userMusicLike where musicIdx = Music.musicIdx) as "좋아요 수",
       CASE
           WHEN CAST(SUBSTRING(TIME_FORMAT(length, '%i:%s'), 1, 1) AS UNSIGNED) = 0
               THEN SUBSTRING(TIME_FORMAT(length, '%i:%s'), 2)
           ELSE TIME_FORMAT(length, '%i:%s')
           END as playtime
from Music
inner join musicPlaylist mP on Music.musicIdx = mP.musicIdx
inner join Singer S on Music.musicianIdx = S.musicianIdx
where mP.playlistIdx = ?;
    `;

    const [playlistMusicResult] = await connection.query(playlistMusicListQuery,playlistIdx);
    return playlistMusicResult;
}

async function getPlayMusicInfo(connection,playlistIdx,musicIdx) {
    const getPlayMusicInfoQuery = `
    select Music.title,S.musicianName,
       albumImgUri,
        (select count(userId)
        from userMusicLike
        where Music.musicIdx = userMusicLike.musicIdx)  as '좋아요 수',
    substring(time_format(length,'%i:%s'),2) as playtime,lyric
from Music

inner join Album A on Music.albumIdx = A.albumIdx
inner join Singer S on Music.musicianIdx = S.musicianIdx
inner join musicPlaylist mP on Music.musicIdx = mP.musicIdx

where Music.musicIdx = ? AND playlistIdx = ?;
    ;`;

    const [playMusicInfoRows] = await connection.query(getPlayMusicInfoQuery,[musicIdx,playlistIdx]);
    return playMusicInfoRows;
}

async function insertMusicHistory(connection,userId,musicIdx) {
    const insertHistoryQuery = `
    INSERT INTO Streaming(userId,musicIdx) values (?,?);
    ;`;

    const insertHistoryRows = await connection.query(insertHistoryQuery,[userId,musicIdx]);
    return insertHistoryRows;
}
//갱신 전 순위 - 갱신 후 순위 => -num : 순위 내려감 +num : 순위 올라감
function updateMusicRanking(connection) {
    const updateMusicRankingQuery = `
INSERT INTO Chart_TOP100(musicIdx, musicianIdx, ranking, StreamingCnt,difference) select * from
(select Streaming.musicIdx as musicIdx,
        S.musicianIdx as musicianIdx,
        row_number() over (order by count(userId) desc) as ranking,
        count(Streaming.userId) as StreamingCnt,
        
        cast(C.ranking as signed) - cast(row_number() over (order by count(Streaming.userId) desc) as signed ) as difference 
from Streaming
inner join Music M on Streaming.musicIdx = M.musicIdx
inner join Singer S on M.musicianIdx = S.musicianIdx
left join Chart_TOP100 C on Streaming.musicIdx = C.musicIdx
group by musicIdx) as B
on duplicate key update Chart_TOP100.musicIdx= B.musicIdx,
                        Chart_TOP100.musicianIdx = B.musicianIdx,
                        Chart_TOP100.ranking = B.ranking,
                        Chart_TOP100.StreamingCnt = B.StreamingCnt,
                        Chart_TOP100.difference = B.difference,
                        Chart_TOP100.updatedAt = now();

    ;`;

    const updateQuery = connection.query(updateMusicRankingQuery);
    return updateQuery;
}

async function getChartInfo(connection,start,pageSize) {
    const selectChartInfoQuery = `
    select ranking,Chart_TOP100.difference as '순위 변동',A.albumImgUri,M.title,S.musicianName from Chart_TOP100
inner join Music M on Chart_TOP100.musicIdx = M.musicIdx
inner join Singer S on M.musicianIdx = S.musicianIdx
inner join Album A on M.albumIdx = A.albumIdx
order by ranking
limit ?,?;
    `;

    const [chartRows] = await connection.query(selectChartInfoQuery,[start,pageSize]);
    return chartRows;
}

async function getChartInfoCursor(connection,start,pageSize) {
    const selectChartInfoQuery = `
    select ranking,Chart_TOP100.difference as '순위 변동',A.albumImgUri,M.title,S.musicianName from Chart_TOP100
inner join Music M on Chart_TOP100.musicIdx = M.musicIdx
inner join Singer S on M.musicianIdx = S.musicianIdx
inner join Album A on M.albumIdx = A.albumIdx
having ranking > ?
order by ranking asc
limit ?;
    ;`;

    const [chartRows] = await connection.query(selectChartInfoQuery,[start,pageSize]);
    return chartRows;
}

async function chartLength(connection) {
    const selectChartLength = `
    select count(musicIdx) as cnt from Chart_TOP100;
    `;
    const [chartLength] = await connection.query(selectChartLength);
    return chartLength
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
    checkMusicPlaylist,
    checkMusicLike,
    insertMusicLike,
    getTimeline,
    selectVideoInfo,
    getMusicianList,
    checkPlaylist,
    getPlaylistInfo,
    getPlaylistMusic,
    getPlayMusicInfo,
    insertMusicHistory,
    updateMusicRanking,
    getChartInfo,
    chartLength,
    getChartInfoCursor

};

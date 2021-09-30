const music = require("./musicController");
const jwtMiddleware = require("../../../config/jwtMiddleware");

module.exports = function(app){
    const music = require('./musicController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 13. 특정 앨범 구성음악 조회 API
    app.get('/albums/:albumIdx/music',music.getMusics);

    // 14. 특정 앨범 정보 조회
    app.get('/albums/:albumIdx/info', music.getInfo);

    // 15. 특정 음악 정보 조회
    app.get('/albums/music/:musicIdx/info', music.getInfoMusic);

    // 16. 가사를 통한 음악 검색 QueryString
    app.get('/albums/music/search',music.searchMusicBylyric);

    // 17. 곡 수정 -JWT
    app.post('/albums/music/:musicIdx',jwtMiddleware, music.editMusicInfo); // status >= 4

    // 18. 곡 삭제 -JWT
    app.delete('/albums/music/:musicIdx',jwtMiddleware, music.deleteMusics); //status >= 4

    // 19. 앨범 댓글 달기 -JWT
    app.post('/albums/:albumIdx/reply/:userId',jwtMiddleware, music.postComments);

    // 20. 앨범 댓글 수정 -JWT
    app.patch('/albums/:albumIdx/reply/:userId',jwtMiddleware,music.patchComments);

    // 21. 앨범 댓글 조회
    app.get('/albums/:albumIdx/reply', music.getComments);

    // 22. 곡 플레이리스트에 추가 -JWT
    app.post('/albums/:musicIdx/playlist',jwtMiddleware,music.insertPlaylists);

    // 23. 좋아요 추가 -JWT
    app.post('/albums/:musicIdx/like',jwtMiddleware,music.addLike);

    // 24. 타임라인
    app.get('/musician/timeline',music.getTimeline);

    // 25. 플레이 리스트 정보 조회
    app.get('/playlist/:playlistIdx/info',jwtMiddleware,music.getPlaylistInfo);

    // 26. 음악 재생화면 -JWT
    app.get('/playlist/:playlistIdx/music/:musicIdx',jwtMiddleware,music.playMusicInfo);

    // 27. 차트 화면 조회 (offset기반 페이지 네이션)
    app.get('/charts/top-100',music.getChartInfo);

    // 27-1. 차트 화면 조회 (cursor 기반 페이지네이션)
    app.get('/charts/top-100/cursor',music.getChartInfoCursor);



};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API
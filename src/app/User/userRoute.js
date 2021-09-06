const user = require("./userController");
module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/test', user.getTest);

    // 1. 유저 생성 (회원가입) API
    app.post('/users', user.postUsers);

    // 2. 유저 조회 API (+ 검색)
    app.get('/users',user.getUsers);

    // 3. 특정 유저 조회 API
    app.get('/users/:userId', user.getUserById);

    // // 3-1. 특정 유저 조회 API TEST
    // app.get('/app/users/:userId', user.getUserById2);

    // 4. 회원탈퇴
    app.delete('/users/:userId', user.deleteUserById);

    // 5. 아이디 찾기
    app.get('/users/id', user.searchUserID); // 삭제

    // 6. 특정 유저 댓글 조회
    app.get('/users/:userId/comments',user.getComment);

    // 7. 특정 유저 플레이리스트 조회
    app.get('/users/:userId/playlists',user.getUserPlaylist);

    // 8. 특정 유저 좋아하는 음악 조회
    app.get('/users/:userId/likes', user.getLikeMusic);

    // 9. 특정 유저 최근 들은 음악 조회
    app.get('/users/:userId/streaming-history', user.getStreamingHistory);

    // 10. 회원 정보 수정
    app.post('/users/:userId/update',user.updateUserInfo);

    // 11. 회원 아이디 변경
    app.post('/users/:userId/id',user.updateUserID);

    // 12. 특정 유저 팔로우한 가수 목록 조회
    app.get('/users/:userId/fan',user.getFanList);






    // TODO: After 로그인 인증 방법 (JWT)
    // 로그인 하기 API (JWT 생성)
    app.post('/app/login', user.login);

    // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)



};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API
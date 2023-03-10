const user = require("./userController");
    module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');



    // π₯ μλ routeμλ /{μ±μ΄λ¦(ex:melon)}/users ... μ΄λ κ² μ§μ΄μ€μΌν¨.

    // 0. νμ€νΈ API
    app.get('/test', user.getTest);

    // 1. μ μ  μμ± (νμκ°μ) API
    app.post('/users', user.postUsers);

    // 2. μ μ  μ‘°ν API (+ κ²μ)
    app.get('/users',jwtMiddleware,user.getUsers);

    // 3. νΉμ  μ μ  μ‘°ν API
    app.get('/users/:userId',jwtMiddleware, user.getUserById);

    // // 3-1. νΉμ  μ μ  μ‘°ν API TEST
    // app.get('/app/users/:userId', user.getUserById2);

    // 4. νμνν΄
    app.delete('/users/:userId',jwtMiddleware, user.deleteUserById);

    // 5. μμ΄λ μ°ΎκΈ°
    app.get('/users/id', user.searchUserID); // μ­μ 

    // 6. νΉμ  μ μ  λκΈ μ‘°ν
    app.get('/users/:userId/comments',jwtMiddleware,user.getComment);

    // 7. νΉμ  μ μ  νλ μ΄λ¦¬μ€νΈ μ‘°ν
    app.get('/users/:userId/playlists',jwtMiddleware,user.getUserPlaylist);

    // 8. νΉμ  μ μ  μ’μνλ μμ μ‘°ν
    app.get('/users/:userId/likes',jwtMiddleware, user.getLikeMusic);

    // 9. νΉμ  μ μ  μ΅κ·Ό λ€μ μμ μ‘°ν
    app.get('/users/:userId/streaming-history',jwtMiddleware, user.getStreamingHistory);

    // 10. νμ μ λ³΄ μμ 
    app.patch('/users/:userId',jwtMiddleware,user.updateUserInfo);

    // 11. νμ μμ΄λ λ³κ²½
    app.post('/users/:userId/id',user.updateUserID); // μ­μ 

    // 12. νΉμ  μ μ  νλ‘μ°ν κ°μ λͺ©λ‘ μ‘°ν
    app.get('/users/:userId/fan',jwtMiddleware,user.getFanList);






    // TODO: After λ‘κ·ΈμΈ μΈμ¦ λ°©λ² (JWT)
    // λ‘κ·ΈμΈ νκΈ° API (JWT μμ±)
    app.post('/login', user.login);

    // νμ μ λ³΄ μμ  API (JWT κ²μ¦ λ° Validation - λ©μλ μ²΄μ΄λ λ°©μμΌλ‘ jwtMiddleware μ¬μ©)
    app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers);

    app.get('/',function (req,res){
        res.send("Hello World!");
        console.log('λ‘κ·ΈμΈν΄μ νμΌλ‘ λμμ΄');
    })

    app.get('/google/login',user.googleLogin);

    // app.post('/oauth/login',user.googleLogin);
    app.get('/auth/google/callback',user.googleLoginCallback);

};


// TODO: μλλ‘κ·ΈμΈ API (JWT κ²μ¦ λ° Payload λ΄λ±κΈ°)
// JWT κ²μ¦ API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: νν΄νκΈ° API
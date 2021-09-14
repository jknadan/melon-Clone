const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");
const {passwordCheck} = require("./userProvider");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (email, PW, name) {
    try {
        // 이메일 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(PW)
            .digest("hex");

        const insertUserInfoParams = [email, hashedPassword, name];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, PW) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email
        console.log(selectEmail);

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(PW)
            .digest("hex");
        console.log(hashedPassword);
        const selectUserPasswordParams = [selectEmail, hashedPassword];

        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].PW !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);
        console.log('이거지' + userInfoRows);

        //  if (userInfoRows.status === "0") {
        //     return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        // }

        console.log(userInfoRows[0].userId) // DB의 userId

        // 토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );
        return response(baseResponse.SUCCESS,{'userId': userInfoRows[0].userId, 'jwt': token})

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editUser = async function (userId, ID) {
    try {
        console.log(userId)
        const connection = await pool.getConnection(async (conn) => conn);
        const editUserResult = await userDao.updateUserInfo(connection, userId, ID)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

// 유저 삭제
exports.deleteUser = async function(userId){
    const connection = await pool.getConnection((async (conn)=> conn));
    const userDeleteResult = await userDao.deleteUserAccount(connection,userId);
    connection.release();

    return userDeleteResult;
}



exports.updateUser = async function(name,age,userId){
    const connection = await pool.getConnection((conn)=>conn);
    const updateUserResult = await userDao.updateUserInfo(connection,name,age,userId);
    console.log(age);
    connection.release();

    return updateUserResult;
}
exports.updateID = async function(id,userId){

    //Vaildation : 회원 여부 확인
    const isExistUser = await userProvider.retrieveUser(userId);

    if(isExistUser === undefined) return errResponse(baseResponse.USER_USERID_NOT_EXIST);
else{

        const connection = await pool.getConnection((conn)=>conn);
        const updateIdResult = await userDao.updateID(connection,id,userId);
        connection.release();

        return response(baseResponse.SUCCESS);

    }
}
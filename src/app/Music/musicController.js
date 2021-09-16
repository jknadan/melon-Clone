const jwtMiddleware = require("../../../config/jwtMiddleware");
const musicProvider = require("../../app/Music/musicProvider");
const musicService = require("../../app/Music/musicService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const userService = require("../../app/User/userService");




/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}

/**
 * API No. 13
 * API Name : 특정 앨범 구성음악 조회 API
 * [GET] /albums/{albumIdx}/music
 */
exports.getMusics = async function (req,res){

    /**
     * Path Variable(타겟이 있는경우): albumId
     */

    const albumIdx = req.params.albumIdx;

    if(!albumIdx) return res.send(errResponse(baseResponse.ALBUM_ALBUMID_EMPTY));

    const albumByAlbumId = await musicProvider.getAlbumMusic(albumIdx);
    return res.send(response(baseResponse.SUCCESS,albumByAlbumId));
}

/**
 * API No. 14
 * API Name : 특정 앨범 정보 조회 API
 * [GET] /albums/{albumIdx}/info
 */
exports.getInfo = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): albumId
     */

    const albumIdx = req.params.albumIdx;
    if(!albumIdx) return res.send(errResponse(baseResponse.ALBUM_ALBUMID_EMPTY));

    const albumInfo = await musicProvider.getAlbumInfo(albumIdx);
    return res.send(response(baseResponse.SUCCESS, albumInfo));
}

/**
 * API No. 15
 * API Name : 특정 음악 정보 조회 API
 * [GET] /albums/music/:musicIdx/info
 */
exports.getInfoMusic = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): musicIdx
     */

    const musicIdx = req.params.musicIdx;
    if(!musicIdx) return res.send(errResponse(baseResponse.ALBUM_ALBUMID_EMPTY));

    const musicInfo = await musicProvider.getMusicInfo(musicIdx);
    return res.send(response(baseResponse.SUCCESS, musicInfo));
}
/**
 * API No. 16
 * API Name : 가사로 음악 검색 API
 * [GET] /albums/music/search
 */


exports.searchMusicBylyric = async function(req,res){

    /**
     * Query String: lyric
     */
    const lyric = req.query.lyric;
    if(!lyric) return res.send(errResponse(baseResponse.CONTENT_EMPTY));
    else if(typeof lyric !== typeof "string") return res.send(errResponse(baseResponse.CONTENT_TYPE_ERROR));

    const keyword = "%" + lyric + "%";

    const searchResult = await musicProvider.getMusicByLyric(keyword);
    return res.send(response(baseResponse.SUCCESS, searchResult));

}

/**
 * API No. 17
 * API Name : 음악 정보 수정 API
 * [POST] /albums/music/{musicIdx}
 */

exports.editMusicInfo = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): musicIdx
     * Body: title,lyric
     */

    const musicIdx = req.params.musicIdx;

    var {title,lyric} = req.body;

    // var title = req.body.title;
    // var lyric = req.body.lyric;

    if(!title && !lyric) return res.send(errResponse(baseResponse.CONTENT_EMPTY));
    else if(!title){
        const defaultTitle = await musicProvider.getMusicInfo(musicIdx);
        title = defaultTitle[0].title;
    }else if(!lyric){
        const defaultLyric = await musicProvider.getMusicInfo(musicIdx);
        lyric = defaultLyric[0].lyric;
    }

     const updateMusicResult = await musicService.updateMusicInfo(musicIdx,title,lyric);
    return res.send(updateMusicResult);
}
/**
 * API No. 18
 * API Name : 음악 삭제 API
 * [DELETE] /albums/music/{musicIdx}
 */
exports.deleteMusics = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): musicIdx
     */

    const musicIdx = req.params.musicIdx;
    if(!musicIdx) return res.send(response(baseResponse.CONTENT_EMPTY));

    await musicService.deleteMusic(musicIdx);
    return res.send(response(baseResponse.SUCCESS));

}

/**
 * API No. 19
 * API Name : 앨범에 댓글 달기 API
 * [POST] /albums/{albumIdx}/reply
 */
exports.postComments = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): commentIdx
     * Body : contents,email,PW
     */

    const albumIdx = req.params.albumIdx;
    const {contents,email,PW} = req.body;

    //로그인 먼저
    const signInResponse = await userService.postSignIn(email,PW);
    console.log((signInResponse))
    // return 값 userId : (:userId)
    const userId = signInResponse.userId;
    console.log(userId)
    if(!userId){
        return res.send(baseResponse.SIGNIN_EMPTY_ACCOUNT);
    } else{
        // userId갖고 댓글 달기
        const commentResult = await musicService.postComment(userId,albumIdx,contents);

        return res.send(commentResult);
    }

}
/**
 * API No. 20
 * API Name : 앨범에 댓글 수정 API
 * [PATCH] /albums/{albumIdx}/reply/{commentIdx}
 */
exports.patchComments = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): albumIdx ,commentIdx
     * Body : contents,email,PW
     */

    const {contents,email,PW} = req.body;
    const commentIdx = req.params.commentIdx;
    //로그인 먼저
    const signInResponse = await userService.postSignIn(email,PW);
    const userId = signInResponse.userId;
    // console.log('이건' + userId);

    const commentResult = await musicService.updateComment(userId,commentIdx,contents);

    return res.send(commentResult);


}
/**
 * API No. 21
 * API Name : 앨범에 댓글 수정 API
 * [GET] /albums/{albumIdx}/reply
 */
exports.getComments = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): albumIdx
     */

    const albumIdx = req.params.albumIdx;
    if(!albumIdx) return res.send(response(baseResponse.ALBUM_ALBUMID_EMPTY));

    const commentList = await musicProvider.getCommentList(albumIdx);
    return res.send(response(baseResponse.SUCCESS,commentList));


}


/**
 * API No. 22
 * API Name : 곡 플레이리스트 추가하기 API
 * [GET] /albums/{musicIdx}/playlist
 */
exports.insertPlaylists = async function(req,res){
    /**
     * Path Variable(타겟이 있는경우): musicIdx
     * Body : playlistIdx
     */

    const musicIdx = req.params.musicIdx;
    const playlistIdx = req.body.playlistIdx;

    const insertMusic = await musicService.insertMusicPL(musicIdx,playlistIdx);
    return res.send(insertMusic);

}
/**
 * API No. 23
 * API Name : 곡 좋아요 체크하기 API
 * [POST] /albums/{musicIdx}/like
 */
exports.addLike = async function(req,res){

    /**
     * Path Variable(타겟이 있는경우): musicIdx
     * Query String: userId
     */

    const musicIdx = req.params.musicIdx;
    const userId = req.query.userId;

    if(!userId) {
        return res.send(errResponse(baseResponse.USER_NOT_LOGIN));
    }else if(!musicIdx){
        return res.send(errResponse(baseResponse.CONTENT_EMPTY));
    }
    else{
        const musicLikeResponse = await musicService.addMusicLike(userId,musicIdx);
        return res.send(musicLikeResponse);
    }

}
/**
 * API No. 24
 * API Name : 아티스트 타임라인 조회 API
 * [GET] /musician/timeline
 */
exports.getTimeline = async function(req,res){
    /**
     * Query String: musicianIdx
     */

    const musicianIdx = req.query.musicianIdx;
    if(!musicianIdx) return res.send(errResponse(baseResponse.CONTENT_EMPTY));

    const timelineResult = await musicProvider.getTimeline(musicianIdx);

    return res.send(response(baseResponse.SUCCESS,timelineResult));

}

/**
 * API No. 25
 * API Name : 플레이리스트 정보 조회 API
 * [GET] /playlist/{playlistIdx}/info
 */
exports.getPlaylistInfo = async function(req,res){
    /**
     * Path Variable: playlistIdx
     */

    const playlistIdx = req.params.playlistIdx;
    if(!playlistIdx) return res.send(errResponse(baseResponse.CONTENT_EMPTY));

    const playlistInfo = await musicProvider.getPlaylistInfo(playlistIdx);
    console.log(playlistInfo);

    return res.send(playlistInfo);

}

/**
 * API No. 26
 * API Name : 플레이리스트 내부 음악 재생 API
 * [GET] /playlist/{playlistIdx}/music/{musicIdx}
 */
exports.playMusicInfo = async function(req,res){

    /**
     * Path Variable: playlistIdx, musicIdx
     * QueryString: userId
     */

    const playlistIdx = req.params.playlistIdx;
    const musicIdx = req.params.musicIdx;
    const userId = req.query.userId; // 스트리밍 기록(Streaming Table에 userId MusicIdx추가)에 필요한 userId. JWT로 대체 가능한가

    console.log(userId);

    if(!musicIdx) return res.send(errResponse(baseResponse.CONTENT_EMPTY));

    const musicPlayResult = await musicProvider.getPlayMusicInfo(playlistIdx,musicIdx,userId);

    return res.send(response(baseResponse.SUCCESS, musicPlayResult));

}
/**
 * API No. 27
 * API Name : 플레이리스트 내부 음악 재생 API
 * [GET] /chart/top-100
 */
exports.getChartInfo = async function (req,res){
    const chartInfo = await musicProvider.getChartInfo();

    return res.send(response(baseResponse.SUCCESS,chartInfo));
}
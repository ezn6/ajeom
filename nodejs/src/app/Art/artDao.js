//홈>사용자별 분야+키워드 불러오기
async function getHome(connection,userId) {
    const getHomeQuery = `
        select Fielduser.fieldId,name
        from Fielduser, Field
        where userId=? and Field.fieldId = Fielduser.fieldId
        order by Fielduser.fieldId;
        `;
    const getHomeRow = await connection.query(
        getHomeQuery,
        userId
    );
    return getHomeRow[0];
}

//홈>분야별 작품 불러오기 limit 5
async function getArtByField(connection,fieldId) {
    const getHomeQuery = `
        select img, a.artId
        from Fieldart f,Artwork a
        where f.fieldId=? and f.artId = a.artId
        order by rand() limit 5;
        `;
    const getHomeRow = await connection.query(
        getHomeQuery,
        fieldId
    );
    return getHomeRow[0];
}

//홈>최고 아티스트 (구독 1명 이상부터) limit 6 // 기준 나중에 바꾸기
async function bestArtist(connection,userId) {
    const bestArtistQuery = `
        select userId,nickname, profile, (select count(*) from Subscribe where User.userId=artistId and status=1) as subCount
        from User
        where (select count(*) from Subscribe where User.userId=artistId and status=1)>=1 and status=1
        order by rand() limit 6;
        `;
    const getHomeRow = await connection.query(
        bestArtistQuery,
        userId
    );
    return getHomeRow[0];
}

//새로운 아티스트 limit 6,(일주일이내 작품등록한작가,grade=6)
async function newArtist(connection,userId) {
    const newArtistQuery = `
        select distinct u.userId,nickname,profile
        from User u, Artwork a
        where a.userId=u.userId and a.createdAt > DATE_ADD(now(), INTERVAL -7 DAY) and grade=6 and u.status=1
        order by rand() limit 6;
        `;
    const getHomeRow = await connection.query(
        newArtistQuery,
        userId
    );
    return getHomeRow[0];
}

//작품 올리기
async function postArt(connection,params) {//userId,title, caption, img, price, link
    const postArtQuery = `
        INSERT INTO Artwork (userId, title, caption, img, price, link, type, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT);
        `;
    const postArtRow = await connection.query(
        postArtQuery,
        params
    );
    return postArtRow[0];
}

//작품 분야,키워드 설정하기
async function postArtField(connection,artId,fieldId) {
    const postArtFieldQuery = `
        INSERT INTO Fieldart (artId,fieldId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const postArtFieldRow = await connection.query(
        postArtFieldQuery,
        [artId,fieldId]
    );
    return postArtFieldRow[0];
}

//artId 찾기
async function findArtId(connection,userId,title) {
    const findArtIdQuery = `
        select artId
        from Artwork
        where userId=? and title=?;
        `;
    const findArtIdRow = await connection.query(
        findArtIdQuery,
        [userId,title]
    );
    return findArtIdRow[0];
}

//내 이미지함 저장
async function saveImg(connection,artId,userId) {
    const saveImgIdQuery = `
        INSERT INTO Myimg (artId, userId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const saveImgRow = await connection.query(
        saveImgIdQuery,
        [artId,userId]
    );
    return saveImgRow[0];
}

//artwork 존재, status=1확인
async function artwork(connection,artId) {
    const artworkQuery = `
        select *
        from Artwork
        where artId=? and status=1;
        `;
    const artworkRow = await connection.query(
        artworkQuery,
        artId
    );
    return artworkRow[0];
}

//보관함생성
async function postStorage(connection,userId,title,caption,share) {
    const postStorageQuery = `
        INSERT INTO ajeom.Storage (userId, title, caption, share, heart, save, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT);
        `;
    const postStorageRow = await connection.query(
        postStorageQuery,
        [userId,title,caption,share]
    );
    return postStorageRow[0];
}

//storageId 찾기
async function findstorageId(connection,userId,title,caption) {
    const postStorageQuery = `
        select storageId
        from Storage
        where userId=? and title=? and caption=?;
        `;
    const postStorageRow = await connection.query(
        postStorageQuery,
        [userId,title,caption]
    );
    return postStorageRow[0];
}

//내 이미지함에서 이미지 선택하고 보관함 만들기
async function selectImg(connection,storageId,myimgId) {
    const postStorageQuery = `
        INSERT INTO Bookmark (stoargeId, myimgId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const postStorageRow = await connection.query(
        postStorageQuery,
        [storageId,myimgId]
    );
    return postStorageRow[0];
}

//옅보기 탭 : 옅보기수 top 10(상단)/ 이미지모두없으면 아예 안뜸, rank10위까지만 뜨게함, save수 0개는 제외함
async function topLook(connection, userId) {
    const Query = `
        select *
        from
            (select s.title,a.img,u.nickname,u.profile,s.save, rank() over (order by save desc) as rnk,s.storageId
             from Storage s,Bookmark b, Myimg i, Artwork a,User u
             where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
                 b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
                 s.status=1 and b.status=1 and i.status=1 and a.status=1 and s.share=1 and s.save>0
            ) ranked
        where ranked.rnk<11
        order by rand();
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기>베스트(하트수)
// async function bestHeart(connection, userId) {
//     const Query = `
//         select s.title,a.img,a.title,u.nickname,u.profile,s.save
//         from Storage s,Bookmark b, Myimg i, Artwork a,User u
//         where s.heart = (select max(heart) from Storage) and
//             s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
//             limit 1;
//         `;
//     const Row = await connection.query(
//         Query,
//         userId
//     );
//     return Row[0];
// }
//
// //옅보기>최근
// async function latest(connection, userId) {
//     const Query = `
//         select s.title,a.img,a.title,u.nickname,u.profile,s.save
//         from Storage s,Bookmark b, Myimg i, Artwork a,User u
//         where s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
//         order by s.createdAt desc limit 1;
//         `;
//     const Row = await connection.query(
//         Query,
//         userId
//     );
//     return Row[0];
// }
//
// //옅보기>급상승
// async function increase(connection, userId) {
//     const Query = `
//         select s.title,a.img,a.title,u.nickname,u.profile,s.save
//         from Storage s,Bookmark b, Myimg i, Artwork a,User u
//         where s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
//         order by s.updatedAt desc limit 1;
//         `;
//     const Row = await connection.query(
//         Query,
//         userId
//     );
//     return Row[0];
// }

//내 작품 삭제하기
async function delArt(connection, userId,artId) {
    const Query = `
        UPDATE ajeom.Artwork t SET t.status = 2 WHERE t.userId = ? and t.artId = ?;
        `;
    const Row = await connection.query(
        Query,
        [userId,artId]
    );
    return Row[0];
}

//보관함탭>내보관함 미리보기 5개 생성최근순(상단)
//이미지 다 삭제되었어도 보관함자체는 보이게해야함(내가보관함을 삭제 안했으니까)
async function storage(connection, userId) {
    const Query = `
        select a.img,s.storageId
        from Storage s,Bookmark b, Myimg i, Artwork a
        where s.userId = ? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.share=1 and s.status=1
        order by s.createdAt desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//보관함탭>내이미지 미리보기 1개 최근(하단)
async function storage2(connection, userId,userId) {
    const Query = `
        select a.img,(select count(*) from Myimg where userId = ?) as icount,a.artId,i.myimgId
        from Myimg i, Artwork a
        where i.userId = ? and i.artId=a.artId and i.status=1 and a.status=1
        order by i.createdAt desc limit 1;
        `;
    const Row = await connection.query(
        Query,
        [userId,userId]
    );
    return Row[0];
}

//옅보기탭>베스트보관함 : 첫번째 페이지 (하트수기준) limit 4 s.heart>0
async function lookBest(connection, userId) {
    const Query = `
        select s.storageId,s.title,a.img,s.heart,s.save,u.profile,u.nickname,
               concat(lpad(s.heart,5,'0'),lpad(s.storageId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and s.heart>0 and s.share=1
        order by s.heart desc, s.storageId desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기탭>베스트보관함 : 두번째 페이지 (하트수기준) limit 4
async function lookBestNext(connection, cursor) {
    const Query = `
        select s.storageId,s.title,a.img,s.heart,s.save,u.profile,u.nickname,
               concat(lpad(s.heart,5,'0'),lpad(s.storageId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and s.heart>0 and s.share=1 and
                concat(lpad(s.heart,5,'0'),lpad(s.storageId,3,'0')) < ?
        order by s.heart desc, s.storageId desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        cursor
    );
    return Row[0];
}

//옅보기탭>최근보관함 : 첫번째 페이지 limit 4 일주일이내라는 조건 없음!
async function lookRecent(connection, userId) {
    const Query = `
        select s.storageId,s.title,a.img,s.heart,s.save,u.profile,u.nickname,
               concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14, '0'),lpad(s.storageId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and s.share=1 and
            s.status=1 and b.status=1 and i.status=1 and a.status=1
        order by s.createdAt desc, s.storageId desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기탭>최근보관함 : 두번째 페이지 limit 4
async function lookRecentNext(connection, cursor) {
    const Query = `
        select s.storageId,s.title,a.img,s.heart,s.save,u.profile,u.nickname,
               concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14, '0'),lpad(s.storageId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and s.share=1 and
                concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14, '0'),lpad(s.storageId,3,'0')) < ?
        order by s.createdAt desc, s.storageId desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        cursor
    );
    return Row[0];
}

//보관함 상세(상단), 사진이 한장이라도 있으면 뜨고,없으면 없는화면res보낸다./ 삭제된 보관함이라면?:storageId받을때 밸리검사>alert!
async function storageTop(connection,userId,storageId,userId,storageId,storageId) {
    const Query = `
        select s.storageId,s.title,s.caption,a.img,s.heart,s.save,u.nickname,
               exists(select * from Save where Save.userId=? and Save.storageId=? and Save.status=1) as store,
               exists(select * from Storagelike l where l.userId=? and l.storageId=? and l.status=1) as likes
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId=? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId and status=1) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and a.status=1 and s.share=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId,userId,storageId,storageId]
    );
    return Row[0];
}

//보관함상세(하단) : 첫번째 limit 8
async function storageDetail(connection, storageId) {
    const Query = `
        select a.artId,a.img,
               concat(lpad(DATE_FORMAT(b.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a
        where s.storageId = ? and s.storageId = b.storageId and b.myimgId= i.myimgId and i.artId = a.artId and
            s.status=1 and b.status=1 and a.status=1 and s.share=1
        order by b.createdAt desc, a.artId desc limit 8;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//보관함상세(하단) : 두번째 limit 8
async function storageDetailNext(connection, storageId,cursor) {
    const Query = `
        select a.artId,a.img,
               concat(lpad(DATE_FORMAT(b.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a
        where s.storageId = ? and s.storageId = b.storageId and b.myimgId= i.myimgId and i.artId = a.artId and
            s.status=1 and b.status=1 and a.status=1 and s.share=1 and
                concat(lpad(DATE_FORMAT(b.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) < ?
        order by b.createdAt desc, a.artId desc limit 8;
        `;
    const Row = await connection.query(
        Query,
        [storageId,cursor]
    );
    return Row[0];
}

//작품상세페이지_상단
async function artDetail(connection,artId) {
    const Query = `
        select a.artId,a.img,a.title,a.price,a.link
        from Artwork a
        where artId = ? and a.status=1;
        `;
    const Row = await connection.query(
        Query,
        artId
    );
    return Row[0];
}

//작품상세페이지_하단_리뷰들 limit 5
async function artReviews(connection,artId) {
    const Query = `
        select r.reviewId,r.caption,u.userId,u.nickname,u.profile
        from Review r,User u,Artwork a
        where a.artId = ? and a.userId=r.artistId and r.status=1 and a.status=1 and r.userId=u.userId
        order by rand() limit 5;
        `;
    const Row = await connection.query(
        Query,
        artId
    );
    return Row[0];
}

//내이미지함_이미 존재하는 이미지인지 확인
async function existImg(connection,artId,userId) {
    const Query = `
        select *
        from Myimg
        where artId=? and userId=? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [artId,userId]
    );
    return Row[0];
}

//내보관함_나에게 존재하는 보관함인지 확인
async function myexistStorage(connection,userId,storageId) {
    const Query = `
        select *
        from Storage
        where userId = ? and storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//그냥 존재하는 보관함인지 확인 status
async function existStorage(connection,storageId) {
    const Query = `
        select *
        from Storage
        where storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//내 보관함 삭제
async function delStorage(connection,userId,storageId) {
    const Query = `
        UPDATE ajeom.Storage t SET t.status = 2 WHERE t.userId=? and t.storageId = ?;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함에 좋아요 하트 눌렀는지 여부 확인
async function existLike(connection,userId,storageId) {
    const Query = `
        select *
        from Storagelike
        where userId = ? and storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함에 좋아요 누르기
async function likeStorage(connection,userId,storageId) {
    const Query = `
        INSERT INTO ajeom.Storagelike (userId, storageId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함에 좋아요 누르기 >> 하트수 증가하기
async function plusLike(connection,storageId) {
    const Query = `
        update Storage t set heart = heart + 1 where storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//보관함에 좋아요 취소
async function delLikeStorage(connection,userId,storageId) {
    const Query = `
        UPDATE ajeom.Storagelike t SET t.status = 2 WHERE t.userId = ? and t.storageId = ? and t.status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함에 좋아요 취소 >> 하트수 감소하기
async function minLike(connection,storageId) {
    const Query = `
        update Storage t set heart = heart - 1 where storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//보관함 이미 저장했는지 여부 확인
async function existSave(connection,userId,storageId) {
    const Query = `
        select *
        from Save
        where userId= ? and storageId= ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함 저장하기
async function saveStorage(connection,userId,storageId) {
    const Query = `
        INSERT INTO ajeom.Save (userId, storageId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT)
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함 저장하기 >> 저장수 증가하기
async function plusSave(connection,storageId) {
    const Query = `
        update Storage t set save = save + 1 where storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//보관함 저장 취소
async function delSaveStorage(connection,userId,storageId) {
    const Query = `
        UPDATE ajeom.Save t SET t.status = 2 WHERE t.userId = ? and t.storageId = ? and t.status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,storageId]
    );
    return Row[0];
}

//보관함 저장하기 >> 저장수 증가하기
async function minSave(connection,storageId) {
    const Query = `
        update Storage t set save = save - 1 where storageId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
    );
    return Row[0];
}

//내이미지함에 존재하는지
async function existMyimg(connection,userId,myimgId) {
    const Query = `
        select *
        from Myimg
        where userId=? and myimgId=? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,myimgId]
    );
    return Row[0];
}

//내이미지함 이미지 삭제
async function delImg(connection,userId,myimgId) {
    const Query = `
        UPDATE ajeom.Myimg t SET t.status = 2 WHERE t.userId = ? and t.myimgId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,myimgId]
    );
    return Row[0];
}

//내 이미지함에 존재하는 이미지인지 확인
async function findMyImg(connection,userId,myimgId) {
    const Query = `
        select *
        from Myimg
        where userId=? and myimgId=? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,myimgId]
    );
    return Row[0];
}

module.exports = {
    getHome,
    getArtByField,
    bestArtist,
    newArtist,
    postArt,
    findArtId,
    postArtField,
    saveImg,
    artwork,
    postStorage,
    findstorageId,
    selectImg,
    topLook,
    // bestHeart,latest,increase,
    delArt,
    storage,storage2,
    lookBest,lookBestNext,
    lookRecent,lookRecentNext,
    storageTop,storageDetail,storageDetailNext,artDetail,artReviews,existImg,myexistStorage,delStorage,
    existLike,likeStorage,existStorage,delLikeStorage,plusLike,minLike,existSave,saveStorage,plusSave,
    delSaveStorage,minSave,existMyimg,delImg,findMyImg,
};
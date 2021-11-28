//사용자별 분야+키워드 불러오기
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

//분야별 작품 불러오기 limit 5
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

//최고 아티스트 (구독 1명 이상부터) limit 6 // 기준 나중에 바꾸기
async function bestArtist(connection,userId) {
    const bestArtistQuery = `
        select userId,nickname, profile, (select count(*) from Subscribe where User.userId=artistId) as subCount
        from User
        where (select count(*) from Subscribe where User.userId=artistId)>=1 and status=1
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
async function postArt(connection,params) {
    const postArtQuery = `
        INSERT INTO Artwork (userId, type, title, img, caption, price, link, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT);
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
async function findArtId(connection,userId, type, title) {
    const findArtIdQuery = `
        select artId
        from Artwork
        where userId=? and type=? and title=?;
        `;
    const findArtIdRow = await connection.query(
        findArtIdQuery,
        [userId, type, title]
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
        [userId,artId]
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

//옅보기수 top 10(상단)
async function topLook(connection, userId) {
    const Query = `
        select s.title,a.img,u.nickname,u.profile,s.save, rank() over (order by save desc) as rnk,s.storageId
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1
        order by rand();
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기>베스트(하트수)
async function bestHeart(connection, userId) {
    const Query = `
        select s.title,a.img,a.title,u.nickname,u.profile,s.save
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.heart = (select max(heart) from Storage) and
            s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
            limit 1;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기>최근
async function latest(connection, userId) {
    const Query = `
        select s.title,a.img,a.title,u.nickname,u.profile,s.save
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
        order by s.createdAt desc limit 1;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기>급상승
async function increase(connection, userId) {
    const Query = `
        select s.title,a.img,a.title,u.nickname,u.profile,s.save
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
        order by s.updatedAt desc limit 1;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

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
async function storage(connection, userId) {
    const Query = `
        select a.img,s.storageId
        from Storage s,Bookmark b, Myimg i, Artwork a
        where s.userId = ? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1
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

//옅보기탭>베스트보관함 : 첫번째 페이지 (하트수기준) limit 4
async function lookBest(connection, userId) {
    const Query = `
        select s.storageId,s.title,a.img,s.heart,s.save,u.profile,u.nickname,
               concat(lpad(s.heart,5,'0'),lpad(s.storageId,3,'0')) as cs
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1
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
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1 and
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
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1
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
        where s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1 and
                concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14, '0'),lpad(s.storageId,3,'0')) < ?
        order by s.createdAt desc, s.storageId desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        cursor
    );
    return Row[0];
}

//보관함 상세(상단)
async function storageTop(connection, storageId) {
    const Query = `
        select s.storageId,s.title,s.caption,a.img,s.heart,s.save,u.nickname
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = ? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
            b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and u.status=1;
        `;
    const Row = await connection.query(
        Query,
        storageId
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
            s.status=1 and b.status=1 and i.status=1 and a.status=1
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
            s.status=1 and b.status=1 and i.status=1 and a.status=1 and
                concat(lpad(DATE_FORMAT(b.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) < ?
        order by b.createdAt desc, a.artId desc limit 8;
        `;
    const Row = await connection.query(
        Query,
        [storageId,cursor]
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
    topLook,bestHeart,latest,increase,
    delArt,
    storage,storage2,
    lookBest,lookBestNext,
    lookRecent,lookRecentNext,
    storageTop,storageDetail,storageDetailNext,
};
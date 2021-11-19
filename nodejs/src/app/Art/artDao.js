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

//최고 아티스트 (눈도장좋아요 100개초과시) limit 6
async function bestArtist(connection,userId) {
    const bestArtistQuery = `
        select nickname,profile
        from User
        where likes>100
        order by rand() limit 6;
        `;
    const getHomeRow = await connection.query(
        bestArtistQuery,
        userId
    );
    return getHomeRow[0];
}

//새로운 아티스트 (일주일이내) limit 6
async function newArtist(connection,userId) {
    const newArtistQuery = `
        select nickname,profile
        from User
        where createdAt > DATE_ADD(now(), INTERVAL -7 DAY)
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

//옅보기수 top 10
async function topLook(connection, userId) {
    const Query = `
        select s.title,a.img,a.title,u.nickname,u.profile,s.save, rank() over (order by save desc) as rrANK
        from Storage s,Bookmark b, Myimg i, Artwork a,User u
        where s.storageId = b.storageId and b.myimgId = i.myimgId and i.artId = a.artId and s.userId=u.userId
        order by rand() limit 10;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//옅보기>베스트
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
    topLook,bestHeart,latest,increase
};
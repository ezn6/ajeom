//구독
async function subscribe(connection,userId,artistId) {
    const Query = `
        INSERT INTO ajeom.Subscribe (userId, artistId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId]
    );
    return Row[0];
}

//이미 구독한 사람인지 확인
async function existSub(connection,userId,artistId) {
    const Query = `
        select *
        from Subscribe
        where userId=? and artistId=? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId]
    );
    return Row[0];
}

//구독취소
async function delsub(connection,userId,artistId) {
    const Query = `
        UPDATE Subscribe t SET t.status = 2 WHERE t.userId = ? and t.artistId=?;
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId]
    );
    return Row[0];
}

//구독탭>베스트작가-첫번째
async function subBestFirst(connection,userId) {
    const Query = `
        select userId,nickname, profile, (select count(*) from Subscribe where User.userId=artistId and status=1) as subCount,User.grade,gName,
               concat(lpad((select count(*) from Subscribe where User.userId=artistId and status=1),5,'0'),lpad(userId,3,'0')) as cs
        from User
        where (select count(*) from Subscribe where User.userId=artistId and status=1)>=1 and status=1
        order by subCount desc, userId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//구독탭>베스트작가-두번째이상
async function subBestNext(connection,cs) {
    const Query = `
        select userId,nickname, profile, (select count(*) from Subscribe where User.userId=artistId and status=1) as subCount,User.grade,gName,
               concat(lpad((select count(*) from Subscribe where User.userId=artistId and status=1),5,'0'),lpad(userId,3,'0')) as cs
        from User
        where (select count(*) from Subscribe where User.userId=artistId and status=1)>=1 and status=1 and
                concat(lpad((select count(*) from Subscribe where User.userId=artistId),5,'0'),lpad(userId,3,'0')) < ?
        order by subCount desc, userId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        cs
    );
    return Row[0];
}

//구독작가리스트-첫번째
async function subArtist(connection,userId) {
    const Query = `
        select s.artistId,i.nickname,i.profile,i.gName,(select count(*) from Subscribe b where b.artistId=s.artistId and status=1) as subCount,
               concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.artistId,3,'0')) as cs
        from User u,Subscribe s,User i
        where u.userId=? and u.userId = s.userId and s.status=1 and s.artistId=i.userId and i.status=1
        order by s.createdAt desc, s.artistId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//구독작가리스트-두번째
async function subArtistNext(connection,userId,cursor) {
    const Query = `
        select s.artistId,i.nickname,i.profile,i.gName,(select count(*) from Subscribe b where b.artistId=s.artistId and status=1) as subCount,
               concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.artistId,3,'0')) as cs
        from User u,Subscribe s,User i
        where u.userId=? and u.userId = s.userId and s.status=1 and s.artistId=i.userId and i.status=1 and
                concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.artistId,3,'0')) < ?
        order by s.createdAt desc, s.artistId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        [userId,cursor]
    );
    return Row[0];
}

//구독탭>최근작가-첫번째(일주일이내 작품등록한작가,grade=6)
async function subRecent(connection,userId) {
    const Query = `
        select distinct User.userId,nickname, profile,
                        (select count(*) from Subscribe where User.userId=artistId and status=1) as subCount,User.grade,gName,
                        concat(lpad(User.userId,3,'0')) as cs
        from User,Artwork i
        where grade=6 and i.createdAt > DATE_ADD(now(), INTERVAL -7 DAY) and User.userId = i.userId and User.status=1
        order by User.userId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//구독탭>최근작가-두번째(일주일이내 작품등록한작가,grade=6)
async function subRecentNext(connection,cursor) {
    const Query = `
        select distinct User.userId,nickname, profile,
                        (select count(*) from Subscribe where User.userId=artistId and status=1) as subCount,User.grade,gName,
                        concat(lpad(User.userId,3,'0')) as cs
        from User,Artwork i
        where grade=6 and i.createdAt > DATE_ADD(now(), INTERVAL -7 DAY) and User.userId = i.userId and User.status=1 and
            concat(lpad(User.userId,3,'0')) < ?
        order by User.userId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        cursor
    );
    return Row[0];
}

//구독탭
async function subTab(connection,userId) {
    const Query = `
        select img,artId
        from Artwork
        where status=1
        order by rand() limit 6;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//구독후기작성
async function subReview(connection,userId, artistId, caption) {
    const Query = `
        INSERT INTO Review (userId, artistId, caption, status, createdAt, updatedAt)
        VALUES (?, ?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId, artistId, caption]
    );
    return Row[0];
}

//작가상세_상단
async function ArtistDetailTop(connection,userId,artistId,artistId) {
    const Query = `
        select userId,nickname,profile,summary,grade,
               exists(select * from Subscribe where Subscribe.userId=? and artistId=? and Subscribe.status=1) as sub
        from User
        where userId=? and status=1;
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId,artistId]
    );
    return Row[0];
}

//작가상세_중간(최신작품4개만 보여지게)
async function ArtistDetailMid(connection,artistId) {
    const Query = `
        select artId,img
        from Artwork
        where userId=? and status=1
        order by createdAt desc limit 4;
        `;
    const Row = await connection.query(
        Query,
        artistId
    );
    return Row[0];
}

//작가상세_하단 리뷰 랜덤(limit 5)
async function ArtistDetailBot(connection,artistId) {
    const Query = `
        select u.userId,u.nickname,u.profile,r.caption,r.reviewId
        from Review r,User u
        where r.artistId = ? and r.status=1 and r.userId=u.userId
        order by rand() limit 5;
        `;
    const Row = await connection.query(
        Query,
        artistId
    );
    return Row[0];
}

//작가의 작품: 첫번째 limit 10
async function artworks(connection,artistId) {
    const Query = `
        select artId,img,
               concat(lpad(DATE_FORMAT(createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(artId,3,'0')) as cs
        from Artwork
        where userId = ? and status=1
        order by createdAt desc, artId desc limit 10;
        `;
    const Row = await connection.query(
        Query,
        artistId
    );
    return Row[0];
}

//작가의 작품: 두번째 limit 10
async function artworksNext(connection,artistId,cursor) {
    const Query = `
        select artId,img,
               concat(lpad(DATE_FORMAT(createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(artId,3,'0')) as cs
        from Artwork
        where userId = ? and status=1 and
                concat(lpad(DATE_FORMAT(createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(artId,3,'0')) < ?
        order by createdAt desc, artId desc limit 10;
        `;
    const Row = await connection.query(
        Query,
        [artistId,cursor]
    );
    return Row[0];
}

//작가에게한마디(구독후기) 첫번째 limit 5
async function reviews(connection,artistId) {
    const Query = `
        select r.reviewId,r.caption,u.nickname,u.profile,u.userId,
               concat(lpad(DATE_FORMAT(r.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(r.reviewId,3,'0')) as cs
        from Review r,User u
        where r.artistId = ? and r.status=1 and r.userId=u.userId
        order by  r.createdAt desc, r.reviewId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        artistId
    );
    return Row[0];
}

//작가에게한마디(구독후기) 두번째 limit 5
async function reviewsNext(connection,artistId,cursor) {
    const Query = `
        select r.reviewId,r.caption,u.nickname,u.profile,u.userId,
               concat(lpad(DATE_FORMAT(r.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(r.reviewId,3,'0')) as cs
        from Review r,User u
        where r.artistId = ? and r.status=1 and r.userId=u.userId and
                concat(lpad(DATE_FORMAT(r.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(r.reviewId,3,'0')) < ?
        order by  r.createdAt desc, r.reviewId desc limit 5;
        `;
    const Row = await connection.query(
        Query,
        [artistId,cursor]
    );
    return Row[0];
}


module.exports = {
    subscribe,
    existSub,
    delsub,
    subBestFirst,
    subBestNext,
    subArtist,
    subArtistNext,
    subRecent,
    subRecentNext,
    subTab,
    subReview,
    ArtistDetailTop,ArtistDetailMid,ArtistDetailBot,
    artworks,artworksNext,reviews,reviewsNext,
};
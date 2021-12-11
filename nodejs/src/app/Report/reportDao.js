//존재하는 리뷰인지(status=1)
async function isReview(connection,reviewId) {
    const Query = `
        select *
        from Review
        where status=1 and reviewId=?;
        `;
    const Row = await connection.query(
        Query,
        reviewId
    );
    return Row[0];
}

//리뷰 신고하기
async function reportReview(connection,userId,reviewId,number,caption) {
    const Query = `
        INSERT INTO ajeom.Report_review (userId,reviewId, reportNum, caption, status, createdAt, updatedAt)
        VALUES (?, ?, ?,?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId,reviewId,number,caption]
    );
    return Row[0];
}

//신고할 유저찾기
async function findReport(connection,reviewId) {
    const Query = `
        select userId
        from Review
        where reviewId=?;
        `;
    const Row = await connection.query(
        Query,
        reviewId
    );
    return Row[0];
}

//신고누적하기
async function reportNumcount(connection,userId) {
    const Query = `
        update User t set report = report + 1 where userId = ? and status=1;
        `;
    const Row = await connection.query(
        Query,
        userId
    );
    return Row[0];
}

//계정 신고하기
async function userReport(connection,userId,artistId,number,caption) {
    const Query = `
        INSERT INTO ajeom.Report_user (userId,artistId, reportNum, caption, status, createdAt, updatedAt)
        VALUES (?,?,?,?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId,number,caption]
    );
    return Row[0];
}

//작품 게시물 신고하기
async function artReport(connection,userId,artId,number,caption) {
    const Query = `
        INSERT INTO ajeom.Report_art (userId,artId, reportNum, caption, status, createdAt, updatedAt)
        VALUES (?,?,?,?, DEFAULT, DEFAULT, DEFAULT);
        `;
    const Row = await connection.query(
        Query,
        [userId,artId,number,caption]
    );
    return Row[0];
}

//신고할 유저찾기(게시물 신고할때 작가)
async function findArtist(connection,artId) {
    const Query = `
        select userId
        from Artwork
        where artId=?;
        `;
    const Row = await connection.query(
        Query,
        artId
    );
    return Row[0];
}


module.exports = {
    isReview,
    reportReview,
    findReport,findArtist,
    reportNumcount,
    userReport,
    artReport,
};
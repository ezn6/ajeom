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
        where userId=? and artistId=?;
        `;
    const Row = await connection.query(
        Query,
        [userId,artistId]
    );
    return Row[0];
}




module.exports = {
    subscribe,
    existSub,
};
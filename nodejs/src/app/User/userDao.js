// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(id,nickname,profile)
        VALUES (?,?,?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT id,pw
        FROM kurly.User
        WHERE id=? and pw=?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 userid 값도 가져온다.)
async function selectUserAccount(connection, id) {
  const selectUserAccountQuery = `
        SELECT status, id, userId, nickname
        FROM User 
        WHERE id = ?;
        `;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      id
  );
  return selectUserAccountRow[0];
}


//유저 분야(+키워드) 선택
async function field(connection,userId,fieldId) {
  const fieldQuery = `
        INSERT INTO ajeom.Fielduser (userId, fieldId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
  const fieldRow = await connection.query(
      fieldQuery,
      [userId,fieldId]
  );
  return fieldRow[0];
}


//유저 분야/키워드 삭제
async function fieldout(connection,userId,fieldId) {
  const Query = `
        DELETE FROM Fielduser WHERE userId=? and fieldId=?;
        `;
  const Row = await connection.query(
      Query,
      [userId,fieldId]
  );
  return Row[0];
}

//유저 분야/키워드 추가
async function fieldin(connection,userId,fieldId) {
  const Query = `
        INSERT INTO Fielduser (userId, fieldId, status, createdAt, updatedAt)
        VALUES (?, ?, DEFAULT, DEFAULT, DEFAULT);
        `;
  const Row = await connection.query(
      Query,
      [userId,fieldId]
  );
  return Row[0];
}

//닉네임 수정
async function namePatch(connection,nickname,userId) {
  const Query = `
    UPDATE ajeom.User t SET t.nickname = ? WHERE t.userId = ?;
        `;
  const Row = await connection.query(
      Query,
      [nickname,userId]
  );
  return Row[0];
}

//마이페이지
async function mypage(connection,userId) {
  const Query = `
    select nickname,profile,grade,gName,
           (select count(*) from Myimg m where m.userId = u.userId) as icount,
           (select count(*) from Subscribe s where s.userId = u.userId and s.status=1) as scount
    from User u
    where u.userId=? and u.status=1;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

// 존재하는 유저인지, status=1인지
async function existUserAccount(connection, userId) {
  const Query = `
    select *
    from User
    where userId=? and status=1;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//프로필 수정
async function profilePatch(connection,profile,userId) {
  const Query = `
    UPDATE User t SET t.profile = ? WHERE t.userId = ?;
        `;
  const Row = await connection.query(
      Query,
      [profile,userId]
  );
  return Row[0];
}

// 존재하는 닉네임인지( 닉네임 중복제거)
async function findName(connection, nickname) {
  const Query = `
    select *
    from User
    where nickname=? and status=1;
        `;
  const Row = await connection.query(
      Query,
      nickname
  );
  return Row[0];
}




module.exports = {
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  field,
  fieldout,
  fieldin,
  namePatch,
  mypage,
  existUserAccount,
  profilePatch,
  findName,
};

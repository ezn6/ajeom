// // 모든 유저 조회
// async function selectUser(connection) {
//   const selectUserListQuery = `
//                 SELECT email, nickname
//                 FROM UserInfo;
//                 `;
//   const [userRows] = await connection.query(selectUserListQuery);
//   return userRows;
// }
//
// // 이메일로 회원 조회
// async function selectUserEmail(connection, email) {
//   const selectUserEmailQuery = `
//                 SELECT email,id
//                 FROM User
//                 WHERE email = ?;
//                 `;
//   const [emailRows] = await connection.query(selectUserEmailQuery, email);
//   return emailRows;
// }
//
// // userId 회원 조회
// async function selectUserId(connection, userId) {
//   const selectUserIdQuery = `
//                  SELECT id, email,name
//                  FROM User
//                  WHERE userId = ?;
//                  `;
//   const [userRow] = await connection.query(selectUserIdQuery, userId);
//   //console.log(`data: ${JSON.stringify([userRow])}`)
//   return userRow;
// }

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
        WHERE id = ?;`;
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
    select nickname,profile,grade,
           (select count(*) from Storage s where s.userId = u.userId) as scount,
           (select count(*) from Likes l where l.userId = u.userId) as lcount
    from User u
    where u.userId=?;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}






module.exports = {
  // selectUser,
  // selectUserEmail,
  // selectUserId,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  field,
  fieldout,
  fieldin,
  namePatch,
  mypage,
};

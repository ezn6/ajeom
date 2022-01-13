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
           (select count(*) from Myimg m where m.userId = u.userId and m.status=1) as icount,
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
//프로필 수정시 불러올 화면
async function getProfile(connection,userId) {
  const Query = `
    select profile from User
    where userId = ?;
        `;
  const Row = await connection.query(
      Query,
      userId
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

//내 이미지함: 첫번째 limit 10
async function myimg(connection, userId) {
  const Query = `
    select a.img, a.artId,m.myimgId,
           concat(lpad(DATE_FORMAT(m.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
    from Myimg m,Artwork a
    where m.userId = ? and m.artId=a.artId and m.status=1 and a.status=1
    order by m.createdAt desc, a.artId desc limit 10;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//내 이미지함: 두번째 limit 10
async function myimgNext(connection, userId,cursor) {
  const Query = `
    select a.img, a.artId,m.myimgId,
           concat(lpad(DATE_FORMAT(m.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
    from Myimg m,Artwork a
    where m.userId = ? and m.artId=a.artId and m.status=1 and a.status=1 and
        concat(lpad(DATE_FORMAT(m.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) < ?
    order by m.createdAt desc, a.artId desc limit 10;
        `;
  const Row = await connection.query(
      Query,
      [userId,cursor]
  );
  return Row[0];
}

//내 보관함: 첫번째 limit 4 / 이미지 다 삭제되었어도 보관함자체는 보이게해야함(내가보관함을 삭제 안했으니까)
async function mystorage(connection, userId) {
  const Query = `
    select s.storageId,s.title,s.caption,a.img,
           concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.storageId,3,'0')) as cs
    from Storage s,Bookmark b, Myimg i, Artwork a
    where s.userId = ? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
      b.myimgId= i.myimgId and i.artId = a.artId and s.share=1 and
      s.status=1
    order by s.createdAt desc, s.storageId desc limit 4;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//내 보관함: 두번째 limit 4 / 이미지 다 삭제되었어도 보관함자체는 보이게해야함(내가보관함을 삭제 안했으니까)
async function mystorageNext(connection, userId,cursor) {
  const Query = `
    select s.storageId,s.title,s.caption,a.img,
           concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.storageId,3,'0')) as cs
    from Storage s,Bookmark b, Myimg i, Artwork a
    where s.userId = ? and s.storageId = b.storageId and b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
      b.myimgId= i.myimgId and i.artId = a.artId and s.share=1 and
      s.status=1 and
        concat(lpad(DATE_FORMAT(s.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(s.storageId,3,'0')) < ?
    order by s.createdAt desc, s.storageId desc limit 4;
        `;
  const Row = await connection.query(
      Query,
      [userId,cursor]
  );
  return Row[0];
}

//내작품리스트: 첫번째 limit 5
async function myartworks(connection, userId) {
  const Query = `
    select a.img,a.artId,
           concat(lpad(DATE_FORMAT(a.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
    from Artwork a
    where a.userId = ? and a.status=1
    order by a.createdAt desc, a.artId desc limit 5;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//내작품리스트: 두번째 limit 5
async function myartworksNext(connection, userId,cursor) {
  const Query = `
    select a.img,a.artId,
           concat(lpad(DATE_FORMAT(a.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) as cs
    from Artwork a
    where a.userId = ? and a.status=1 and
        concat(lpad(DATE_FORMAT(a.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(a.artId,3,'0')) < ?
    order by a.createdAt desc, a.artId desc limit 5;
        `;
  const Row = await connection.query(
      Query,
      [userId,cursor]
  );
  return Row[0];
}

//내가저장한옅보기: 첫번째 limit 10/ 이미지 다 삭제되었어도 보관함자체는 보이게해야함
async function mysave(connection, userId) {
  const Query = `
    select v.storageId,s.title,s.save,u.nickname,a.img,
           concat(lpad(DATE_FORMAT(v.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(saveId,3,'0')) as cs
    from Save v,Storage s,Bookmark b, Myimg i, Artwork a,User u
    where v.userId = ? and v.storageId=s.storageId and s.storageId = b.storageId and
        b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
      b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
      v.status=1 and s.status=1 and s.share=1
    order by v.createdAt desc, saveId desc limit 10;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//내가저장한옅보기: 두번째 limit 10/ 이미지 다 삭제되었어도 보관함자체는 보이게해야함
async function mysaveNext(connection, userId,cursor) {
  const Query = `
    select v.storageId,s.title,s.save,u.nickname,a.img,
           concat(lpad(DATE_FORMAT(v.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(saveId,3,'0')) as cs
    from Save v,Storage s,Bookmark b, Myimg i, Artwork a,User u
    where v.userId = ? and v.storageId=s.storageId and s.storageId = b.storageId and
        b.myimgId = (select min(myimgId) from Bookmark t where t.storageId=b.storageId) and
      b.myimgId= i.myimgId and i.artId = a.artId and s.userId=u.userId and
      v.status=1 and s.status=1 and s.share=1 and
        concat(lpad(DATE_FORMAT(v.createdAt,'%Y%m%d%H%i%S'),14,'0'),lpad(saveId,3,'0')) < ?
    order by v.createdAt desc, saveId desc limit 10;
        `;
  const Row = await connection.query(
      Query,
      [userId,cursor]
  );
  return Row[0];
}

//작가한마디 수정
async function summaryPatch(connection,summary,userId) {
  const Query = `
    UPDATE ajeom.User t SET t.summary = ? WHERE t.userId = ?;
        `;
  const Row = await connection.query(
      Query,
      [summary,userId]
  );
  return Row[0];
}

//닉네임 수정시 불러올 화면
async function getName(connection,userId) {
  const Query = `
    select nickname from User
    where userId = ?;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//작가한마디 자기소개 수정시 불러올 화면
async function getSummary(connection,userId) {
  const Query = `
    select summary from User
    where userId = ?;
        `;
  const Row = await connection.query(
      Query,
      userId
  );
  return Row[0];
}

//마이페이지>환경설정
async function setting(connection,userId) {
  const Query = `
    select userId,nickname,profile,User.grade,gName
    from User
    where userId=? and status=1;
        `;
  const Row = await connection.query(
      Query,
      userId
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
  myimg,myimgNext,
  mystorage,mystorageNext,
  myartworks,myartworksNext,
  mysave,mysaveNext,
  summaryPatch,getProfile,getName,getSummary,setting
};

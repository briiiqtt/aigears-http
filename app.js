const express = require("express");
const app = express();
const Response = require("./Response");

app.use(express.json(), (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    new Response(res).badRequest();
  } else {
    next();
  }
});
app.use(express.urlencoded({ extended: false }));

const db = require("./DB");

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

app.route("/test").get((req, res) => {
  console.log("asdfasdfasdfasdf");
  res.send("hi");
});

app
  .route("/accounts")
  .get((req, res) => db.sql.accounts.select(req.query, res))
  /* path:	http://3.35.210.188:52530/accounts
   * method:  GET
   *          |name          |type    |desc
   * input:   | account_uuid | string | 계정UUID
   * output:  | account_uuid | string | 계정UUID
   *          | email        | string | 이메일
   *          | password     | string | 비밀번호
   *          | team         | string | 소속
   * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 제공함.
   */
  .post((req, res) => db.sql.accounts.insert(req.body, res))
  /* path:	http://3.35.210.188:52530/accounts
   * method:	POST
   *          |name          |type    |desc
   * input:   | account_uuid | string | 계정UUID
   *          | email        | string | 이메일
   *          | password     | string | 비밀번호
   *          | team         | string | 소속
   * output:  | affectedRows | integer| 영향받은 건수
   * desc:  	|넘겨받은 입력대로 새로운 계정을 만들어 저장함.
   */
  .delete((req, res) => db.sql.accounts.delete(req.body, res))
  /* path:	http://3.35.210.188:52530/accounts
   * method:  DELETE
   *          |name          |type    |desc
   * input:   | account_uuid | string | 계정UUID
   * output:  | affectedRows | integer| 영향받은 건수
   * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 삭제함.
   */
  .all((req, res) => new Response(res).methodNotAllowed());

app
  .route("/accounts/uuid")
  .get((req, res) => db.sql.accounts.uuid.select(req.query, res))
  /* path:	http://3.35.210.188:52530/accounts/uuid
   * method:  GET
   *          |name          |type    |desc
   * input:   | email        | string | 이메일
   * output:  | account_uuid | string | 계정UUID
   * desc:    |넘겨받은 이메일로 찾은 계정의 UUID를 제공함.
   */
  .all((req, res) => new Response(res).methodNotAllowed());

app
  .route("/accounts/password")
  .get((req, res) => db.sql.accounts.password.select(req.query, res))
  .put((req, res) => db.sql.accounts.password.update(req.body, res))
  .all((req, res) => new Response(res).methodNotAllowed());

/***************************************************
  미구현
 *
 */
app
  .route("/accounts/email")
  .get((req, res) => db.sql.accounts.email.select(req.query, res))
  .put((req, res) => db.sql.accounts.email.update(req.body, res))
  .all((req, res) => new Response(res).methodNotAllowed());
app
  .route("/accounts/team")
  .get((req, res) => db.sql.accounts.team.select(req.query, res))
  .put((req, res) => db.sql.accounts.team.update(req.body, res))
  .all((req, res) => new Response(res).methodNotAllowed());
app
  .route("/game-results")
  .get((req, res) => db.sql.gameResults.select(req.query, res))
  .post((req, res) => db.sql.gameResults.insert(req.body, res))
  .all((req, res) => new Response(res).methodNotAllowed());

app.all("*", (req, res) => {
  new Response(res).notFound();
});

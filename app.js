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
  res.sendFile(`${__dirname}/index.html`);
});

app.post("/get-account", (req, res) =>
  db.sql.accounts.selectRow(req.body, res)
);
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
app.post("/add-account", (req, res) =>
  db.sql.accounts.insertRow(req.body, res)
);
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
app.post("/del-account", (req, res) => db.sql.accounts.deleteRow(req.body, res));
/* path:	http://3.35.210.188:52530/accounts
 * method:  DELETE
 *          |name          |type    |desc
 * input:   | account_uuid | string | 계정UUID
 * output:  | affectedRows | integer| 영향받은 건수
 * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 삭제함.
 */

app.post("/get-account-uuid-by-email", (req, res) =>
  db.sql.accounts.uuid.select(req.body, res)
);
/* path:	http://3.35.210.188:52530/accounts/uuid
 * method:  GET
 *          |name          |type    |desc
 * input:   | email        | string | 이메일
 * output:  | account_uuid | string | 계정UUID
 * desc:    |넘겨받은 이메일로 찾은 계정의 UUID를 제공함.
 */

app.all("*", (req, res) => {
  new Response(res).notFound('요청 경로 잘못됨');
});

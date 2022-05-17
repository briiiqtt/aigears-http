const express = require("express");
const app = express();
const Response = require("./Response");

app.use(express.json(), (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    new Response(res).badRequest(_NAMESPACE.RES_MSG.SYNTAX_ERROR);
  } else {
    next();
  }
});
app.use(express.urlencoded({ extended: false }));

const db = require("./DB");
const _NAMESPACE = require("./_NAMESPACE.JS");

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

app.route("/test").get((req, res) => {
  res.sendFile(`${__dirname}/test.html`);
});

app.post("/get-account", (req, res) =>
  db.sql.accounts.selectRow(req.body, res)
);
/* path:	http://3.35.210.188:52530/get-account
 *          |name           |type    |desc        |
 * input:   | account_uuid  | string  | 계정UUID  | 양자택일
 *          | email         | string  | 이메일    | 양자택일
 *          |
 * output:  | account_uuid  | string  | 계정UUID
 *          | email         | string  | 이메일
 *          | password      | string  | 비밀번호
 *          | team          | string  | 소속
 *          |
 * desc:    | 넘겨받은 UUID로 찾은 계정의 모든 정보를 제공함.
 */
app.post("/add-account", (req, res) =>
  db.sql.accounts.insertRow(req.body, res)
);
/* path:	http://3.35.210.188:52530/add-account
 *          |name           |type     |desc
 * input:   | account_uuid  | string  | 계정UUID
 *          | email         | string  | 이메일
 *          | password      | string  | 비밀번호
 *          |
 * output:  | affectedRows  | integer | 영향받은 건수
 *          |
 * desc:  	|넘겨받은 입력대로 새로운 계정정보를 만들어 저장함.
 */
app.post("/del-account", (req, res) =>
  db.sql.accounts.deleteRow(req.body, res)
);
/* path:	http://3.35.210.188:52530/del-account
 *          |name           |type    |desc
 * input:   | account_uuid  | string | 계정UUID
 *          |
 * output:  | affectedRows  | integer| 영향받은 건수
 *          |
 * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 삭제함.
 */

app.post("/set-team", (req, res) => db.sql.accounts.team.update(req.body, res));
/* path: http://3.35.210.188:52530/set-team
 *        |name           |type     |desc
 * input: | account_uuid  | string  | 계정UUID
 *        | team          | string  | 소속
 *        | icon          | string  | 아이콘
 *        |
 * output:| affectedRows  | integer | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 소속과 아이콘을 넘겨받은 값으로 수정함.
 */

app.post("/add-slot", (req, res) => db.sql.hangers.insertRow(req.body, res));
/* path:  http://3.35.210.188:52530/add-slot
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 행거에 슬롯을 1칸 추가함.
 *
 */

app.post("/change-equipment", (req, res) =>
  db.sql.hangers.update(req.body, res)
);
/* path:  http://3.35.210.188:52530/change-equipment
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | slot_num          | integer     | 슬롯번호
 *        | weapon_uuid_main  | string      | 메인무기UUID  |선택적
 *        | weapon_uuid_sub   | string      | 서브무기UUID  |선택적
 *        | parts_uuid_head   | string      | 머리UUID      |선택적
 *        | parts_uuid_body   | string      | 바디UUID      |선택적
 *        | parts_uuid_arm    | string      | 팔UUID        |선택적
 *        | parts_uuid_leg    | string      | 다리UUID      |선택적
 *        | parts_uuid_booster| string      | 부스터UUID    |선택적
 *        | parts_uuid_core   | string      | 코어UUID      |선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 특정 슬롯의 정보를 바꿈.
 *
 */

app.post("/add-parts", (req, res) => db.sql.parts.insertRow(req.body, res));
/* path:  http://3.35.210.188:52530/add-parts"
 *        |name                |type         |desc
 * input: | 
 *        |
 * output:|
 *        |
 * desc:  |
 *
 */
db.sql.test();

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

/* path:  http://3.35.210.188:52530
 *        |name                |type         |desc
 * input: |
 *        |
 * output:|
 *        |
 * desc:  |
 *
 */

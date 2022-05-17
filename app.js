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
 *          | auth          | integer | 권한
 *          | team          | string  | 소속
 *          | icon          | string  | 아이콘
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

app.post("/get-hangar", (req, res) => db.sql.hangars.select(req.body, res));
/* path:  http://3.35.210.188:52530/get-hangar
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | slot_num          | integer     | 슬롯번호    |선택적
 *        |
 *        | slot_num          | integer     | 슬롯번호
 *        | weapon_uuid_main  | string      | 메인무기UUID
 *        | weapon_uuid_sub   | string      | 서브무기UUID
 *        | parts_uuid_head   | string      | 머리UUID
 *        | parts_uuid_body   | string      | 바디UUID
 *        | parts_uuid_arm    | string      | 팔UUID
 *        | parts_uuid_leg    | string      | 다리UUID
 *        | parts_uuid_booster| string      | 부스터UUID
 *        | parts_uuid_core   | string      | 코어UUID
 *        |
 * desc:  |
 *
 */

app.post("/add-hangar", (req, res) => db.sql.hangars.insertRow(req.body, res));
/* path:  http://3.35.210.188:52530/add-hangar
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 행거에 슬롯을 1칸 추가함.
 *
 */

app.post("/set-hangar", (req, res) => db.sql.hangars.update(req.body, res));
/* path:  http://3.35.210.188:52530/set-hangar
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
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | parts_uuid        | string      | 부품UUID
 *        | name              | string      | 이름
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어
 *        | enhancement       | integer     | 강화단계      |선택적(기본값 0)
 *        | cur_durability    | integer     | 현재내구도    |선택적(기본값 최대내구도)
 *        | max_durability    | integer     | 최대내구도
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 계정UUID에 귀속된 부품정보를 저장함
 *
 */

app.post("/get-parts", (req, res) => db.sql.parts.select(req.body, res));
/* path:  http://3.35.210.188:52530/get-parts
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID    |양자택일
 *        | parts_uuid        | string      | 부품UUID    |양자택일
 *        | slot_using_this   | integer     | 해당부품을  |계정UUID가 제공된 경우에만 작동
 *        |                                   사용하고
 *        |                                   있는 슬롯
 *        |
 * output:| parts_uuid        | string      | 부품UUID
 *        | account_uuid      | string      | 계정UUID
 *        | name              | string      | 이름
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어
 *        | enhancement       | integer     | 강화단계
 *        | cur_durability    | integer     | 현재내구도
 *        | max_durability    | integer     | 최대내구도
 *        | is_customized     | integer     | 커스텀여부  |0:false,1:true
 *        | custom_color_1    | string      | 커스텀색상1
 *        | custom_color_2    | string      | 커스텀색상2
 *        | custom_color_3    | string      | 커스텀색상3
 *        | slot_using_this   | integer     | 해당부품을 사용하고 있는 슬롯
 *        |
 * desc:  | (부품UUID) 또는 (계정UUID+슬롯번호(+구분번호)) 로 찾은 부품의 정보를 제공함.
 */

app.post("/set-parts", (req, res) => db.sql.parts.update(req.body, res));
/* path:  http://3.35.210.188:52530/set-parts
 *        |name               |type         |desc
 * input: | parts_uuid        | string      | 부품UUID      |양자택일
 *        | account_uuid      | string      | 계정UUID      |양자택일(slot_using_this 필수)
 *        | slot_using_this   | integer     | 해당부품을 사용하고 있는 슬롯
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어 | 선택적
 *        | name              | string      | 이름          |선택적
 *        | enhancement       | integer     | 강화단계      |선택적
 *        | cur_durability    | integer     | 현재내구도    |선택적
 *        | max_durability    | integer     | 최대내구도    |선택적
 *        | is_customized     | integer     | 커스텀여부    |0:false,1:true, 선택적
 *        | custom_color_1    | string      | 커스텀색상1   |선택적
 *        | custom_color_2    | string      | 커스텀색상2   |선택적
 *        | custom_color_3    | string      | 커스텀색상3   |선택적
 *        | slot_change_to    | integer     | 바꿀 슬롯번호 |선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | (부품UUID) 또는 (계정UUID+슬롯번호(+구분번호)) 로 찾은 부품의 정보를 수정함.
 *
 */


app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

/* path:  http://3.35.210.188:52530
 *        |name               |type         |desc
 * input: |
 *        |
 * output:|
 *        |
 * desc:  |
 *
 */

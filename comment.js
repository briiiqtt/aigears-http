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

/* path:	http://3.35.210.188:52530/is-pw-correct
 *          |name           |type     |desc
 * input:   | email         | string  | 이메일
 *          | password      | string  | 비밀번호
 *          |
 * output:  | isPWCorrect   | integer | 0:비밀번호틀림
 *          |                         | 1:비밀번호일치
 *          |                         | 2:계정없음
 *          | account_uuid  | string  | 비밀번호 불일치시 null
 * desc:  	|
 */

/* path:	http://3.35.210.188:52530/del-account
 *          |name           |type    |desc
 * input:   | account_uuid  | string | 계정UUID
 *          |
 * output:  | affectedRows  | integer| 영향받은 건수
 *          |
 * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 삭제함.
 */

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

/* path:  http://3.35.210.188:52530/get-robot
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

/* path:  http://3.35.210.188:52530/add-robot
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 행거에 슬롯을 1칸 추가함.
 *
 */

/* path:  http://3.35.210.188:52530/set-profile
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | slot_num          | integer     | 슬롯번호
 *        |
 * output:| result            | string      | success / fail
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 해당 슬롯을 대표로봇으로 설정함
 *
 */

/* path:  http://3.35.210.188:52530/get-profile
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| slot_num          | integer     | 슬롯번호
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 대표로봇의 번호를 제공함
 *
 */

/* path:  http://3.35.210.188:52530/set-robot
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

/* path:  http://3.35.210.188:52530/set-robot-record
 *        |name                     |type         |desc
 * input: | account_uuid            | string      | 계정UUID
 *        | slot_num                | integer     | 슬롯번호
 *        | sally_count             | integer     | 출전횟수(+=)
 *        | destroy_count           | integer     | 적파괴횟수(+=)
 *        | be_destroyed_count      | integer     | 피파괴횟수(+=)
 *        | one_on_one_win_count    | integer     | 일대일승리횟수(+=)
 *        | one_on_one_lose_count   | integer     | 일대일패배횟수(+=)
 *        | total_win_count         | integer     | 총승리횟수(+=)
 *        | total_lose_count        | integer     | 총패배횟수(+=)
 *        | challenge_shortest_time | integer     | 챌린지최단돌파기록(=)
 *        | challenge_high_round    | integer     | 챌린지최고라운드기록(=)
 *        | destroy_count_challenge | integer     | 챌린지적파괴횟수(+=)
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | (+=)는 기존값에 받은값 누적, (=)는 기존값을 받은값으로 덮어씀
 *
 */

/* path:  http://3.35.210.188:52530/add-parts
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

/* path:  http://3.35.210.188:52530/get-parts
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID    |양자택일
 *        | parts_uuid        | string      | 부품UUID    |양자택일
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어     | 선택적
 *        | slot_using_this   | integer     | 해당부품을  |계정UUID가 제공된 경우에만 작동  | 선택적
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

/* path:  http://3.35.210.188:52530/set-parts
 *        |name               |type         |desc
 * input: | parts_uuid        | string      | 부품UUID      |
 *        | account_uuid      | string      | 계정UUID      |
 *        | slot_using_this   | integer     | 해당부품을 사용하고 있는 슬롯
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어 | 선택적
 *        | slot_change_to    | integer     | 바꿀 슬롯번호 |선택적
 *        | name              | string      | 이름          |선택적
 *        | enhancement       | integer     | 강화단계      |선택적
 *        | cur_durability    | integer     | 현재내구도    |선택적
 *        | max_durability    | integer     | 최대내구도    |선택적
 *        | is_customized     | integer     | 커스텀여부    |0:false,1:true, 선택적
 *        | custom_color_1    | string      | 커스텀색상1   |선택적
 *        | custom_color_2    | string      | 커스텀색상2   |선택적
 *        | custom_color_3    | string      | 커스텀색상3   |선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | (부품UUID + 계정UUID) 또는 (계정UUID+슬롯번호(+구분번호)) 로 찾은 부품의 정보를 수정함.
 *
 */

/* path:  http://3.35.210.188:52530/get-commodities
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| gold              | integer     | 골드
 *        | chip              | integer     | 재료1
 *        | bolt              | integer     | 재료2
 *        | ironplate         | integer     | 재료3
 *        | hitorium          | integer     | 재료4
 *        | electric_wire     | integer     | 재료5
 *        | qrd               | string     | 큐리덤
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정의 재화상태를 제공함.
 *
 */

/* path:  http://3.35.210.188:52530/init-commodities
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정의 재화상태를 초기화함.
 *        | ex)회원가입시.
 *
 */

/* path:  http://3.35.210.188:52530/set-commodities
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | gold              | integer     | 골드      |선택적
 *        | chip              | integer     | 재료1     |선택적
 *        | bolt              | integer     | 재료2     |선택적
 *        | ironplate         | integer     | 재료3     |선택적
 *        | hitorium          | integer     | 재료4     |선택적
 *        | electric_wire     | integer     | 재료5     |선택적
 *        | qrd               | string     | 큐리덤    |선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정의 재화상태를 변경함
 *
 */

/* path:  http://3.35.210.188:52530/add-commodities
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | gold              | integer     | 골드      |선택적
 *        | chip              | integer     | 재료1     |선택적
 *        | bolt              | integer     | 재료2     |선택적
 *        | ironplate         | integer     | 재료3     |선택적
 *        | hitorium          | integer     | 재료4     |선택적
 *        | electric_wire     | integer     | 재료5     |선택적
 *        | qrd               | string      | 큐리덤    |선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정의 재화에 입력값을 누적함
 *
 */

/* path:  http://3.35.210.188:52530/add-skill
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | skill_name          | string      | 스킬명
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정에 보유스킬을 추가함
 *
 */

/* path:  http://3.35.210.188:52530/get-skill
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        |
 * output:| skill_name          | string      | 스킬명
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정이 보유하고 있는 스킬목록을 제공함
 *
 */

/* path:  http://3.35.210.188:52530/get-blueprint
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | model               | string      | 종류        |선택적
 *        |
 * output:| account_uuid        | string      | 계정UUID
 *        | stock               | int         | 보유량
 *        | model               | string      | 종류
 *        | is_made             | int         | 해금
 * desc:  | 전달받은 계정UUID로 찾은 계정의 설계도 보유상태를 제공함
 *
 */

/* path:  http://3.35.210.188:52530/set-blueprint
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | stock               | int         | 보유량
 *        | model               | string      | 종류
 *        | is_made             | integer     | 0:해금X, 1:해금O
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | (계정UUID+설계도종류)의 보유량 stock값으로 설정하거나
 *        | 설계도의 해금 여부를 설정한다.
 *
 */

/* path:  http://3.35.210.188:52530/add-blueprint
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | stock               | int         | 보유량
 *        | model               | string      | 종류
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | (계정UUID+설계도종류)의 보유량을 stock 값만큼 추가함.
 *
 */

/* path:  http://3.35.210.188:52530/get-current-and-max-blueprint-count
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | model               | string      | 종류
 *        |
 * output:| stock               | integer     | 현재보유량
 *        | max                 | integer     | 최대보유량
 *        |
 * desc:  | (계정UUID+설계도종류)의 보유량과 해당 설계도의 최대보유량을 제공함
 *
 */

/* path:  http://3.35.210.188:52530/get-reward-info-json
 *        |name                 |type         |desc
 * input: | name                | string      | 업적이름    |선택적
 *        |
 * output:| AchievementReward.json
 *        |
 * desc:  | (모든 업적 또는 전달한 이름의 업적)
 *                       의 완료시 보상에 대한 정보를 제공함.
 *
 */

/* path:  http://3.35.210.188:52530/claim-achievement-reward
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | name                | string      | 업적이름
 *        |
 * output:| result              | string      | success / fail
 *        |
 * desc:  | 전달한 이름의 업적의 완료보상을 전달한 계정UUID에게 지급함.
 *
 */

/* path:  http://3.35.210.188:52530/
 *        |name                 |type         |desc
 * input: |
 *        |
 * output:|
 *        |
 * desc:  |
 *
 */

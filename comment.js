/* path:	https://bskim.aigears.io/get-account
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

/* path:	https://bskim.aigears.io/set-facility-phase
 *          |name             |type      |desc
 * input:   | account_uuid    | string   | 계정UUID
 *          |
 * output:  | facillity_phase | integer  | 시설개선단계
 *          |
 * desc:    | 넘겨받은 UUID로 찾은 계정의 시설개선단계를 설정함.
 */

/* path:	https://bskim.aigears.io/add-account
 *          |name           |type     |desc
 * input:   | account_uuid  | string  | 계정UUID
 *          | email         | string  | 이메일
 *          | password      | string  | 비밀번호
 *          |
 * output:  | affectedRows  | integer | 영향받은 건수
 *          |
 * desc:  	|넘겨받은 입력대로 새로운 계정정보를 만들어 저장함.
 */

/* path:	https://bskim.aigears.io/is-pw-correct
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

/* path:	https://bskim.aigears.io/del-account
 *          |name           |type    |desc
 * input:   | account_uuid  | string | 계정UUID
 *          |
 * output:  | affectedRows  | integer| 영향받은 건수
 *          |
 * desc:    |넘겨받은 UUID로 찾은 계정의 모든 정보를 삭제함.
 */

/* path: https://bskim.aigears.io/set-team
 *        |name           |type     |desc
 * input: | account_uuid  | string  | 계정UUID
 *        | team          | string  | 소속
 *        | icon          | string  | 아이콘
 *        |
 * output:| affectedRows  | integer | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 소속과 아이콘을 넘겨받은 값으로 수정함.
 */

/* path:  https://bskim.aigears.io/get-robot
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
 */

/* path:  https://bskim.aigears.io/add-robot
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 행거에 슬롯을 1칸 추가함.
 */

/* path:  https://bskim.aigears.io/set-profile
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | slot_num          | integer     | 슬롯번호
 *        |
 * output:| result            | string      | success / fail
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 해당 슬롯을 대표로봇으로 설정함
 */

/* path:  https://bskim.aigears.io/get-profile
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| slot_num          | integer     | 슬롯번호
 *        |
 * desc:  | 넘겨받은 UUID로 찾은 계정의 대표로봇의 번호를 제공함
 */

/* path:  https://bskim.aigears.io/set-robot
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
 */

/* path:  https://bskim.aigears.io/delete-robot
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        | slot_num          | integer     | 슬롯번호
 *        | remove_parts      | boolean     | 파츠 삭제할지(true/false)
 *        |
 * output:| result            | string      | 처리결과
 *        |
 * desc:  | (계정UUID+슬롯번호)의 데이터를 비움.
 *        | remove_parts에 true를 넘기면 해당 슬롯에 장착된 파츠들이 모두 삭제됨.
 */

/* path:  https://bskim.aigears.io/set-robot-record
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
 */

/* path:  https://bskim.aigears.io/add-parts
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
 */

/* path:  https://bskim.aigears.io/get-parts
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

/* path:  https://bskim.aigears.io/set-parts
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
 */

/* path:  https://bskim.aigears.io/delete-parts
 *        |name               |type         |desc
 * input: | parts_uuid        | string      | 부품UUID      |
 *        | account_uuid      | string      | 계정UUID      |
 *        | slot_using_this   | integer     | 해당부품을 사용하고 있는 슬롯
 *        | gubun             | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어 | 선택적
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 부품UUID 또는 (계정UUID+슬롯번호+구분번호) 로 찾은 부품을 삭제함
 */

/* path:  https://bskim.aigears.io/init-commodities
 *        |name               |type         |desc
 * input: | account_uuid      | string      | 계정UUID
 *        |
 * output:| affectedRows      | integer     | 영향받은 건수
 *        |
 * desc:  | 재화 초기값을 설정함
 */

/* path:  https://bskim.aigears.io/get-commodities
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
 */

/* path:  https://bskim.aigears.io/set-commodities
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
 */

/* path:  https://bskim.aigears.io/add-commodities
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
 */

/* path:  https://bskim.aigears.io/add-skill
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | skill_name          | string      | 스킬명
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정에 보유스킬을 추가함
 */

/* path:  https://bskim.aigears.io/get-skill
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        |
 * output:| skill_name          | string      | 스킬명
 *        |
 * desc:  | 전달받은 계정UUID로 찾은 계정이 보유하고 있는 스킬목록을 제공함
 */

/* path:  https://bskim.aigears.io/get-blueprint
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | model               | string      | 종류        |선택적
 *        |
 * output:| account_uuid        | string      | 계정UUID
 *        | stock               | int         | 보유량
 *        | model               | string      | 종류
 *        | is_made             | int         | 해금
 * desc:  | 전달받은 계정UUID로 찾은 계정의 설계도 보유상태를 제공함
 */

/* path:  https://bskim.aigears.io/set-blueprint
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
 */

/* path:  https://bskim.aigears.io/add-blueprint
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | stock               | int         | 보유량
 *        | model               | string      | 종류
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | (계정UUID+설계도종류)의 보유량을 stock 값만큼 추가함.
 */

/* path:  https://bskim.aigears.io/get-current-and-max-blueprint-count
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | model               | string      | 종류
 *        |
 * output:| stock               | integer     | 현재보유량
 *        | max                 | integer     | 최대보유량
 *        |
 * desc:  | (계정UUID+설계도종류)의 보유량과 해당 설계도의 최대보유량을 제공함
 */

/* path:  https://bskim.aigears.io/get-reward-info-json
 *        |name                 |type         |desc
 * input: | name                | string      | 업적이름    |선택적
 *        |
 * output:| AchievementReward.json
 *        |
 * desc:  | (모든 업적 또는 전달한 이름의 업적)
 *                       의 완료시 보상에 대한 정보를 제공함.
 */

/* path:  https://bskim.aigears.io/achievement-attained
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | name                | string      | 업적이름
 *        | amount              | integer     | 증가량
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 계정UUID로 찾은 계정의 업적진행을 증가량만큼 증가시킴.
 */

/* path:  https://bskim.aigears.io/get-achievement-progress-and-max-count
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | name                | string      | 업적이름
 *        |
 * output:| progress            | integer     | 진행단계
 *        | max                 | integer     | 최대단계
 *        | got_reward          | integer     | 0:false 1:true
 *        |
 * desc:  | 계정UUID로 찾은 계정의 업적 진행단계와
 *          해당업적의 최대단계를 제공함.
 */

/* path:  https://bskim.aigears.io/claim-achievement-reward
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | name                | string      | 업적이름
 *        |
 * output:| result              | string      | success / fail
 *        |
 * desc:  | 전달한 이름의 업적의 완료보상을 전달한 계정UUID에게 지급함.
 */

/* path:  https://bskim.aigears.io/save-game-result
 *        |name                 |type         |desc
 * input: | gubun               | integer     | ex)0:리그, 1:챌린지 ~~..
 *        | season              | integer     | 시즌
 *        | highest_round       | integer     | 최고라운드 | 선택적
 *        | player1             | string      | 플레이어1 계정UUID
 *        | player2             | string      | 플레이어2 계정UUID | 선택적
 *        | winner              | string      | 승자 계정UUID | 선택적
 *        | play_time           | integer     | 플레이타임(초)
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 게임 결과를 저장함.
 */

/* path:  https://bskim.aigears.io/get-ranking
 *        |name                 |type         |desc
 * input: | gubun               | integer     | 구분 | 선택적
 *        | season              | integer     | 시즌 | 선택적
 *        | rank_high           | integer     | 높은 등수 | 선택적
 *        | rank_low            | integer     | 낮은 등수 | 선택적
 *        |
 * output:| rank                | integer     | 등수
 *        | icon                | string      | 아이콘
 *        | team                | string      | 팀명
 *        | highest_round       | integer     | 최고라운드
 *        | play_time           | integer     | 플레이타임(초)
 *        | account_uuid        | string      | 계정UUID
 *        |
 * desc:  | 랭킹을 제공함.
 *        | 구분 / 시즌 / 높은등수 / 낮은 등수로 필터링가능.
 */

/* path:  https://bskim.aigears.io/enhancement-succeed
 *        |name                 |type         |desc
 * input: | parts_uuid          | string      | 부품UUID      | 파라미터1
 *        | account_uuid        | string      | 계정UUID      | 파라미터2
 *        | slot_using_this     | integer     | 해당부품을 사용하고 있는 슬롯 | 파라미터2
 *        | gubun               | integer     | 0:헤드 1:바디 2:팔 3:다리 4:부스터 5:코어 | 파라미터2
 *        | gold                | integer     | 골드
 *        | chip                | integer     | 재료1
 *        | bolt                | integer     | 재료2
 *        | ironplate           | integer     | 재료3
 *        | hitorium            | integer     | 재료4
 *        | electric_wire       | integer     | 재료5
 *        | qrd                 | string      | 큐리덤
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 강화 단계 설정 + 재화 감소
 *        |
 *        | ((부품UUID) || (계정UUID+슬롯번호+구분번호)) && (재화 중 한 종류)
 */

/* path:  https://bskim.aigears.io/unlock-facility
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        | facility_name       | string      | 시설이름
 *        |
 * output:| affectedRows        | integer     | 영향받은 건수
 *        |
 * desc:  | 입력받은 계정의 잠금해제된 시설 목록에 시설을 추가함.
 */

/* path:  https://bskim.aigears.io/get-unlocked-facility
 *        |name                 |type         |desc
 * input: | account_uuid        | string      | 계정UUID
 *        |
 * output:| unlocked_facility   | string      | 시설이름
 *        |
 * desc:  | 입력받은 계정의 잠금해제된 시설 목록을 제공함.
 */

/* path:  https://bskim.aigears.io/
 *        |name                 |type         |desc
 * input: |
 *        |
 * output:|
 *        |
 * desc:  |
 */

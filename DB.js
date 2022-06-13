const _CONN = require("./_CONNECTION");
const _NAMESPACE = require("./_NAMESPACE.js");
const _ACHIEVEMENT_REWARD = require("./AchievementReward.json");
const _BLUEPRINT = require("./RequireBlueprintCount.json");
const _ACHIEVEMENT_COUNT = require("./AchievementAttainCount.json");
const mysql = require("mysql");
const pool = mysql.createPool(_CONN);

const Response = require("./Response");

/*
 *
 * 개발전용
 *
 */

const _AUTH_CONN = require("./_AUTH_CONN");
const PoolCluster = require("mysql/lib/PoolCluster");
const conn2 = mysql.createConnection(_AUTH_CONN);

const handshake = function () {
  pool.getConnection((err, conn) => {
    conn.query("select 1");
    conn.query("select 2");
    console.log("handshake_databse");
  });
};

const dev = {
  async haejo(res) {
    let data = res.locals.data;
    if (!isAllArgsProvided(data.email)) {
      new Response(res).badRequest(_NAMESPACE.INSUFFICIENT_VALUE);
      return false;
    }
    let account_uuid = null;

    let isAccountExist = true;
    let r = await query(
      null,
      `SELECT ACCOUNT_UUID FROM ACCOUNTS WHERE EMAIL = '${data.email}'`
    );

    if (r.length !== 1) {
      isAccountExist = false;
    } else {
      account_uuid = r[0].ACCOUNT_UUID;
    }

    if (!isAccountExist) {
      new Response(res).badRequest("해당 이메일의 계정 없음");
      return false;
    }

    let conn = await getConn();
    conn.beginTransaction();
    conn2.beginTransaction();
    try {
      conn2.query(`DELETE FROM table_test_auth WHERE email = '${data.email}'`);
      await executeQuery(
        `DELETE FROM PARTS WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM BLUEPRINTS WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM SKILLS WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM ACHIEVEMENTS WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM COMMODITIES WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM FACILITIES WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM SETTINGS WHERE ACCOUNT_UUID = '${account_uuid}'`,
        conn
      );
      await executeQuery(
        `DELETE FROM ACCOUNTS WHERE EMAIL = '${data.email}'`,
        conn
      );
      conn.commit();
      conn2.commit();
      new Response(res).OK();
    } catch (err) {
      conn.rollback();
      conn2.rollback();
      console.error(err);
      new Response(res).internalServerError();
    } finally {
      conn.release();
    }
  },
};

/*
 *
 * 개발전용
 *
 */

const query = function (res, sql) {
  //FIXME: deprecated
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) throw err;
      conn.query(sql, (err, result, fields) => {
        if (err) {
          if (res) {
            switch (err.code) {
              case "ER_DUP_ENTRY":
                new Response(res).badRequest(_NAMESPACE.RES_MSG.DUPLICATED_PK);
                break;

              case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
                new Response(res).badRequest(
                  _NAMESPACE.RES_MSG.TYPE_MISMATCH + `(${err.sqlMessage})`
                );
                break;

              default:
                console.error(err);
                new Response(res).internalServerError();
            }
          }
          reject(err);
        } else {
          if (res) {
            new Response(
              res,
              result.affectedRows !== undefined
                ? { affectedRows: result.affectedRows }
                : result
            ).OK();
          }
          resolve(result);
        }
      });
      if (conn) conn.release();
    });
  });
};
const getConn = function () {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });
};
const executeQuery = function (sql, conn) {
  return new Promise(async (resolve, reject) => {
    let connectionProvided = true;
    if (!conn) {
      connectionProvided = false;
      conn = await getConn();
    }
    conn.query(sql, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length === 1 ? result[0] : result);
      }
    });
    if (!connectionProvided) {
      conn.release();
    }
  });
};
const sendExceptionResponse = function (err) {
  console.error(err);
  let msg = "";
  if (err.code) {
    switch (err.code) {
      case "EXAMPLE ERR 1":
        msg += "예시 에러 1 메시지";
    }
  }
  if (msg === "") new Response(res).internalServerError();
  else new Response(res).badRequest(msg);
  return;
};

const sql = {
  accounts: {
    async getAccount(res) {
      let data = res.locals.data;
      if (falseIfOneTruthy(data.account_uuid, data.email)) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
      SELECT
        ACCOUNT_UUID, EMAIL, PASSWORD, AUTH, TEAM, ICON, FACILITY_PHASE, WALLET_ADDRESS
      FROM
        ACCOUNTS
      WHERE 1=1
        AND _IS_DELETED = 0
        AND (
          ACCOUNT_UUID = '${data.account_uuid}'
          OR EMAIL = '${data.email}'
          )
      `;

      let qr = null;
      try {
        qr = await executeQuery(sql);
      } catch (err) {
        sendExceptionResponse(err);
        return;
      }

      let resp = {
        ACCOUNT_UUID: qr.ACCOUNT_UUID,
        EMAIL: qr.EMAIL,
        PASSWORD: qr.PASSWORD,
        AUTH: qr.AUTH,
        TEAM: qr.TEAM,
        ICON: qr.ICON,
        FACILITY_PHASE: qr.FACILITY_PHASE,
        WALLET_ADDRESS: qr.WALLET_ADDRESS,
      };
      new Response(res, resp).OK();
    },
    setFacilityPhase(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined &&
        data.facility_phase === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          ACCOUNTS
        SET
          FACILITY_PHASE = '${data.facility_phase}'
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
    addAccount(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined ||
        data.email === undefined ||
        data.password === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
      INSERT INTO
        ACCOUNTS(
          ACCOUNT_UUID, EMAIL, PASSWORD
        )
        VALUES(
          '${data.account_uuid}', '${data.email}', '${data.password}'
        )
      `;
      query(res, sql);
    },
    delAccount(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          ACCOUNTS
        SET
          _IS_DELETED = 1,
          _UPDATED_AT = NOW()
        WHERE 1=1
          AND _IS_DELETED = 0
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
    async isPWCorrect(res) {
      let data = res.locals.data;
      if (data.email === undefined || data.password === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
          SELECT
            ACCOUNT_UUID,
            PASSWORD
          FROM
            ACCOUNTS
          WHERE 1=1
            AND _IS_DELETED = 0
            AND EMAIL = '${data.email}'
        `;
      let r = await query(null, sql);
      let pw = null;
      let ACCOUNT_UUID = null;
      try {
        pw = r[0].PASSWORD;
        ACCOUNT_UUID = r[0].ACCOUNT_UUID;
      } catch (e) {
        new Response(res, { IS_PW_CORRECT: 2, ACCOUNT_UUID: null }).OK();
        return false;
      }
      if (pw == data.password) {
        new Response(res, { IS_PW_CORRECT: 1, ACCOUNT_UUID }).OK();
      } else {
        new Response(res, { IS_PW_CORRECT: 0, ACCOUNT_UUID: null }).OK();
      }
    },
    team: {
      setTeam(res) {
        let data = res.locals.data;
        if (
          data.account_uuid === undefined ||
          data.team === undefined ||
          data.icon === undefined
        ) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        let sql = `
          UPDATE
            ACCOUNTS
          SET
            TEAM = '${data.team}',
            ICON = '${data.icon}',
            _UPDATED_AT = NOW()
          WHERE
            1=1
            AND _IS_DELETED = 0
            AND ACCOUNT_UUID = '${data.account_uuid}'
        `;
        query(res, sql);
      },
    },
  },
  robots: {
    getRobot(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          SLOT_NUM,
          PARTS_UUID_HEAD,
          PARTS_UUID_BODY,
          PARTS_UUID_ARM,
          PARTS_UUID_LEG,
          PARTS_UUID_BOOSTER,
          PARTS_UUID_CORE,
          PARTS_UUID_WEAPON_M,
          PARTS_UUID_WEAPON_S,
          NAME,
          COATING,
          TOKEN_ID,
          CARD_UUID
        FROM
          ROBOTS
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          ${
            data.slot_num !== undefined ? "AND SLOT_NUM = " + data.slot_num : ""
          }
      `;
      query(res, sql);
    },
    addRobot(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          ROBOTS (ACCOUNT_UUID, SLOT_NUM)
          VALUES (
            '${data.account_uuid}',
            IFNULL((SELECT A FROM (SELECT MAX(SLOT_NUM)+1 "A" FROM ROBOTS WHERE ACCOUNT_UUID = '${data.account_uuid}') A),0 ))
        `;
      query(res, sql);
    },
    async setRobot(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.slot_num === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      //
      let gap = 0;
      let r = await query(
        null,
        `SELECT IFNULL(MAX(SLOT_NUM),-1) "MAX" FROM ROBOTS WHERE ACCOUNT_UUID = '${data.account_uuid}'`
      );

      let maxSlotNum = r[0].MAX;
      if (maxSlotNum === -1) {
        gap = data.slot_num * 1 + 1;
      } else if (maxSlotNum <= data.slot_num) {
        gap = data.slot_num - maxSlotNum;
      }

      let arr = [];
      for (let i = 0; i < gap; i++) {
        arr.push(
          `
        INSERT INTO
          ROBOTS (ACCOUNT_UUID, SLOT_NUM)
          VALUES (
            '${data.account_uuid}',
            IFNULL((SELECT A FROM (SELECT IFNULL(MAX(SLOT_NUM),-1)+1 "A" FROM ROBOTS WHERE ACCOUNT_UUID = '${data.account_uuid}') A),0 ))
        `
        );
      }

      let conn = await getConn();
      conn.beginTransaction();
      try {
        for (let a of arr) {
          await executeQuery(a, conn);
        }
        let sql = `UPDATE ROBOTS SET _UPDATED_AT = CURRENT_TIMESTAMP()`;
        if (data.parts_uuid_arm !== undefined)
          sql += `, PARTS_UUID_ARM = '${data.parts_uuid_arm}'`;
        if (data.parts_uuid_head !== undefined)
          sql += `, PARTS_UUID_HEAD = '${data.parts_uuid_head}'`;
        if (data.parts_uuid_leg !== undefined)
          sql += `, PARTS_UUID_LEG = '${data.parts_uuid_leg}'`;
        if (data.parts_uuid_body !== undefined)
          sql += `, PARTS_UUID_BODY = '${data.parts_uuid_body}'`;
        if (data.parts_uuid_booster !== undefined)
          sql += `, PARTS_UUID_BOOSTER = '${data.parts_uuid_booster}'`;
        if (data.parts_uuid_weapon_m !== undefined)
          sql += `, PARTS_UUID_WEAPON_M = '${data.parts_uuid_weapon_m}'`;
        if (data.parts_uuid_weapon_s !== undefined)
          sql += `, PARTS_UUID_WEAPON_S = '${data.parts_uuid_weapon_s}'`;
        if (data.parts_uuid_core !== undefined)
          sql += `, PARTS_UUID_CORE = '${data.parts_uuid_core}'`;
        if (data.coating !== undefined) sql += `, COATING = '${data.coating}'`;
        if (data.name !== undefined) sql += `, NAME = '${data.name}'`;
        if (data.token_id !== undefined)
          sql += `, TOKEN_ID = '${data.token_id}'`;
        if (data.card_uuid !== undefined)
          sql += `, CARD_UUID = '${data.card_uuid}'`;
        sql += `
      WHERE 1=1
        AND ACCOUNT_UUID = '${data.account_uuid}'
        AND SLOT_NUM = '${data.slot_num}'
      `;
        let r = await executeQuery(sql, conn);
        conn.commit();
        let resp = { affectedRows: r.affectedRows };
        new Response(res, resp).OK();
      } catch (err) {
        conn.rollback();
        console.error(err);
        new Response(res).internalServerError();
        return;
      } finally {
        conn.release();
      }
    },
    async deleteRobot(res) {
      let data = res.locals.data;
      if (!isAllArgsProvided(data.account_uuid, data.slot_num)) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }

      let sql = `
      UPDATE
        ROBOTS
      SET
        _UPDATED_AT = CURRENT_TIMESTAMP(),
        TOKEN_ID = NULL,
        CARD_UUID = NULL,
        PARTS_UUID_HEAD = NULL,
        PARTS_UUID_BODY = NULL,
        PARTS_UUID_ARM = NULL,
        PARTS_UUID_LEG = NULL,
        PARTS_UUID_BOOSTER = NULL,
        PARTS_UUID_CORE = NULL,
        PARTS_UUID_WEAPON_M = NULL,
        PARTS_UUID_WEAPON_S = NULL,
        COATING = NULL,
        NAME = NULL,
        PROFILE = NULL,
        SALLY_COUNT = NULL,
        DESTROY_COUNT = NULL,
        BE_DESTROYED_COUNT = NULL,
        ONE_ON_ONE_WIN_COUNT = NULL,
        ONE_ON_ONE_LOSE_COUNT = NULL,
        TOTAL_WIN_COUNT = NULL,
        TOTAL_LOSE_COUNT = NULL,
        CHALLENGE_SHORTEST_TIME = NULL,
        CHALLENGE_HIGH_ROUND = NULL,
        DESTROY_COUNT_CHALLENGE = NULL
      WHERE 1=1
        AND ACCOUNT_UUID = '${data.account_uuid}'
        AND SLOT_NUM = '${data.slot_num}'`;

      let sql2 = `
      UPDATE
        PARTS
      SET
        _IS_DELETED = 1,
        _UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE 1=1
        AND _IS_DELETED = 0
        AND PARTS_UUID IN (SELECT * FROM (SELECT PARTS_UUID FROM PARTS
          WHERE 1=1
            AND GUBUN NOT IN (6,7,8)
            AND ACCOUNT_UUID = '${data.account_uuid}'
            AND SLOT_USING_THIS = '${data.slot_num}') AS A)`;

      let sql3 = `
      UPDATE
        PARTS
      SET
        _UPDATED_AT = CURRENT_TIMESTAMP(),
        SLOT_USING_THIS = -1
      WHERE 1=1
        AND _IS_DELETED = 0
        AND PARTS_UUID IN (
          SELECT * FROM (SELECT PARTS_UUID FROM PARTS
            WHERE 1=1
          AND GUBUN IN (6,7,8)
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND SLOT_USING_THIS = '${data.slot_num}') AS A)`;

      let conn = await getConn();
      conn.beginTransaction();

      try {
        if (data.remove_parts === true) {
          let qr3 = await executeQuery(sql3, conn);
          let qr2 = await executeQuery(sql2, conn);
        }
        let qr = await executeQuery(sql, conn);
        conn.commit();
        new Response(res, { result: "success" }).OK();
      } catch (err) {
        console.error(err);
        conn.rollback();
        new Response(res).internalServerError();
      } finally {
        conn.release();
      }
    },
    setRobotRecord(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.slot_num === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          ROBOTS
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${
            data.sally_count !== undefined
              ? ", SALLY_COUNT = (SELECT * FROM (SELECT IFNULL(SALLY_COUNT,0) + " +
                data.sally_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.destroy_count !== undefined
              ? ", DESTROY_COUNT = (SELECT * FROM (SELECT IFNULL(DESTROY_COUNT,0) + " +
                data.destroy_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.be_destroyed_count !== undefined
              ? ", BE_DESTROYED_COUNT = (SELECT * FROM (SELECT IFNULL(BE_DESTROYED_COUNT,0) + " +
                data.be_destroyed_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.one_on_one_win_count !== undefined
              ? ", ONE_ON_ONE_WIN_COUNT = (SELECT * FROM (SELECT IFNULL(ONE_ON_ONE_WIN_COUNT,0) + " +
                data.one_on_one_win_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.one_on_one_lose_count !== undefined
              ? ", ONE_ON_ONE_LOSE_COUNT = (SELECT * FROM (SELECT IFNULL(ONE_ON_ONE_LOSE_COUNT,0) + " +
                data.one_on_one_lose_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.total_win_count !== undefined
              ? ", TOTAL_WIN_COUNT = (SELECT * FROM (SELECT IFNULL(TOTAL_WIN_COUNT,0) + " +
                data.total_win_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.total_lose_count !== undefined
              ? ", TOTAL_LOSE_COUNT = (SELECT * FROM (SELECT IFNULL(TOTAL_LOSE_COUNT,0) + " +
                data.total_lose_count +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.challenge_shortest_time !== undefined
              ? ", CHALLENGE_SHORTEST_TIME = " + data.challenge_shortest_time
              : ""
          }
          ${
            data.challenge_high_round !== undefined
              ? ", CHALLENGE_HIGH_ROUND = " + data.challenge_high_round
              : ""
          }
          ${
            data.destroy_count_challenge !== undefined
              ? ", DESTROY_COUNT_CHALLENGE = (SELECT * FROM (SELECT IFNULL(DESTROY_COUNT_CHALLENGE,0) + " +
                data.destroy_count_challenge +
                " FROM ROBOTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND SLOT_NUM = '${data.slot_num}'
      `;
      query(res, sql);
    },
    async setProfile(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.slot_num === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }

      let conn = await getConn();
      try {
        await executeQuery(
          `
        UPDATE
          ROBOTS
        SET
          PROFILE = 0
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND PROFILE = 1
        `,
          conn
        );
        await executeQuery(
          `
        UPDATE
          ROBOTS
        SET
          PROFILE = 1
        WHERE 1=1
            AND ACCOUNT_UUID = '${data.account_uuid}'
            AND SLOT_NUM ='${data.slot_num}'
        `,
          null
        );
        conn.commit();
        new Response(res, { result: "success" }).OK();
      } catch (err) {
        console.error(err);
        conn.rollback();
        new Response(res, { result: "fail" }).internalServerError();
      } finally {
        conn.release();
      }
    },
    getProfile(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          SLOT_NUM
        FROM
          ROBOTS
        WHERE 1=1
          AND PROFILE = 1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
  },
  parts: {
    addParts(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined ||
        data.parts_uuid === undefined ||
        data.name === undefined ||
        data.gubun === undefined ||
        data.max_durability === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          PARTS(
            PARTS_UUID,
            ACCOUNT_UUID,
            NAME,
            GUBUN,
            ENHANCEMENT,
            CUR_DURABILITY,
            MAX_DURABILITY
          )
          VALUES(
            '${data.parts_uuid}',
            '${data.account_uuid}',
            '${data.name}',
            '${data.gubun}',
            '${data.enhancement ? data.enhancement : 0}',
            '${
              data.cur_durability && data.cur_durability !== undefined
                ? data.cur_durability
                : data.max_durability
            }',
            '${data.max_durability}'
          )
      `;
      query(res, sql);
    },
    getParts(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined && data.parts_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          PARTS_UUID,
          ACCOUNT_UUID,
          NAME,
          GUBUN,
          ENHANCEMENT,
          CUR_DURABILITY,
          MAX_DURABILITY,
          IS_CUSTOMIZED,
          CUSTOM_COLOR_1,
          CUSTOM_COLOR_2,
          CUSTOM_COLOR_3,
          SLOT_USING_THIS
        FROM
          PARTS
        WHERE 1=1
          AND _IS_DELETED = 0
          ${
            data.parts_uuid !== undefined
              ? "AND PARTS_UUID = '" + data.parts_uuid + "'"
              : ""
          }
          ${
            data.account_uuid !== undefined
              ? "AND ACCOUNT_UUID = '" + data.account_uuid + "'"
              : ""
          }
          ${
            data.account_uuid !== undefined &&
            data.slot_using_this !== undefined
              ? "AND SLOT_USING_THIS = " + data.slot_using_this
              : ""
          }
          ${data.gubun !== undefined ? "AND GUBUN = " + data.gubun : ""}
      `;
      query(res, sql);
    },
    async setParts(res) {
      let data = res.locals.data;
      if (
        (data.account_uuid === undefined ||
          data.slot_using_this === undefined) &&
        data.parts_uuid === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.slot_change_to && data.parts_uuid) {
        let flag = true;
        let r = await query(
          null,
          `SELECT ACCOUNT_UUID FROM PARTS WHERE PARTS_UUID = '${data.parts_uuid}'`
        );
        if (r.length !== 1) {
          new Response(res).badRequest();
          flag = false;
          return false;
        }
        if (r[0].ACCOUNT_UUID !== data.account_uuid) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.IT_IS_NOT_YOUR_PARTS);
          flag = false;
          return false;
        }
        if (!flag) return false;
      }
      let sql = `
        UPDATE
          PARTS
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${data.name !== undefined ? ", NAME = '" + data.name + "'" : ""}
          ${data.gubun !== undefined ? ", GUBUN = " + data.gubun : ""}
          ${
            data.enhancement !== undefined
              ? ", ENHANCEMENT = " + data.enhancement
              : ""
          }
          ${
            data.cur_durability !== undefined
              ? ", CUR_DURABILITY = " + data.cur_durability
              : ""
          }
          ${
            data.max_durability !== undefined
              ? ", MAX_DURABILITY = " + data.max_durability
              : ""
          }
          ${
            data.is_customized !== undefined
              ? ", IS_CUSTOMIZED = " + data.is_customized
              : ""
          }
          ${
            data.custom_color_1 !== undefined
              ? ", CUSTOM_COLOR_1 = '" + data.custom_color_1 + "'"
              : ""
          }
          ${
            data.custom_color_2 !== undefined
              ? ", CUSTOM_COLOR_2 = '" + data.custom_color_2 + "'"
              : ""
          }
          ${
            data.custom_color_3 !== undefined
              ? ", CUSTOM_COLOR_3 = '" + data.custom_color_3 + "'"
              : ""
          }
          ${
            data.slot_change_to !== undefined
              ? ", SLOT_USING_THIS = " + data.slot_change_to
              : ""
          }
        WHERE 1=1
          ${
            data.account_uuid !== undefined &&
            data.slot_using_this !== undefined
              ? "AND ACCOUNT_UUID = '" +
                data.account_uuid +
                "' AND SLOT_USING_THIS = '" +
                data.slot_using_this +
                "'"
              : ""
          }
          ${
            data.parts_uuid !== undefined
              ? "AND PARTS_UUID = '" + data.parts_uuid + "'"
              : ""
          }
          ${data.gubun !== undefined ? "AND GUBUN = " + data.gubun : ""}
      `;
      query(res, sql);
    },
    deleteParts(res) {
      let data = res.locals.data;
      if (
        (data.account_uuid === undefined ||
          data.slot_using_this === undefined ||
          data.gubun === undefined) &&
        data.parts_uuid === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          PARTS
        SET
          _IS_DELETED = 1
        WHERE 1=1
          ${
            data.parts_uuid !== undefined
              ? `AND PARTS_UUID = '${data.parts_uuid}'`
              : ""
          }
          ${
            data.account_uuid !== undefined
              ? `AND ACCOUNT_UUID = '${data.account_uuid}'`
              : ""
          }
          ${
            data.slot_using_this !== undefined
              ? `AND SLOT_USING_THIS = '${data.slot_using_this}'`
              : ""
          }
          ${data.gubun !== undefined ? `AND GUBUN = '${data.gubun}'` : ""}
      `;
      query(res, sql);
    },
  },
  commodities: {
    initCommodities(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          COMMODITIES(ACCOUNT_UUID)
          VALUES('${data.account_uuid}')
      `;
      query(res, sql);
    },
    getCommodities(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          IFNULL(GOLD,0) "GOLD",
          IFNULL(CHIP,0) "CHIP",
          IFNULL(BOLT,0) "BOLT",
          IFNULL(IRONPLATE,0) "IRONPLATE",
          IFNULL(HITORIUM,0) "HITORIUM",
          IFNULL(ELECTRIC_WIRE,0) "ELECTRIC_WIRE",
          IFNULL(QRD,0) "QRD"
        FROM
          COMMODITIES
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
    setCommodities(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          COMMODITIES
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${data.gold !== undefined ? ", GOLD = " + data.gold : ""}
          ${data.chip !== undefined ? ", CHIP = " + data.chip : ""}
          ${data.bolt !== undefined ? ", BOLT = " + data.bolt : ""}
          ${
            data.ironplate !== undefined
              ? ", IRONPLATE = " + data.ironplate
              : ""
          }
          ${data.hitorium !== undefined ? ", HITORIUM = " + data.hitorium : ""}
          ${
            data.electric_wire !== undefined
              ? ", ELECTRIC_WIRE = " + data.electric_wire
              : ""
          }
          ${data.qrd !== undefined ? ", QRD = " + data.qrd : ""}
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
    async addCommodities(res, conn) {
      let data = res.locals.data;
      if (
        falseIfAllTruthy(
          data.account_uuid,
          !falseIfOneTruthy(
            data.gold,
            data.chip,
            data.bolt,
            data.ironplate,
            data.hitorium,
            data.electric_wire,
            data.qrd
          )
        )
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        console.log(2222222222);
        return false;
      }
      let connectionProvided = true;
      if (!conn) {
        conn = await getConn();
        connectionProvided = false;
      }

      let sql = `
        UPDATE
          COMMODITIES
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${
            data.gold !== undefined
              ? ", GOLD = (SELECT * FROM (SELECT IFNULL(GOLD,0) + " +
                data.gold +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.chip !== undefined
              ? ", CHIP = (SELECT * FROM (SELECT IFNULL(CHIP,0) + " +
                data.chip +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.bolt !== undefined
              ? ", BOLT = (SELECT * FROM (SELECT IFNULL(BOLT,0) + " +
                data.bolt +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.ironplate !== undefined
              ? ", IRONPLATE = (SELECT * FROM (SELECT IFNULL(IRONPLATE,0) + " +
                data.ironplate +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.hitorium !== undefined
              ? ", HITORIUM = (SELECT * FROM (SELECT IFNULL(HITORIUM,0) + " +
                data.hitorium +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.electric_wire !== undefined
              ? ", ELECTRIC_WIRE = (SELECT * FROM (SELECT IFNULL(ELECTRIC_WIRE,0) + " +
                data.electric_wire +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.qrd !== undefined
              ? ", QRD = (SELECT * FROM (SELECT IFNULL(QRD,0) + " +
                data.qrd +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;

      try {
        let r = await executeQuery(sql, conn);
        if (r.affectedRows === 0) {
          await executeQuery(
            `
          INSERT INTO COMMODITIES (ACCOUNT_UUID)
          VALUES ('${data.account_uuid}')`,
            conn
          );
          let result = await executeQuery(sql, conn);
          conn.commit();
          new Response(res, { affectedRows: result.affectedRows }).OK();
        } else {
          if (res.locals.doNotResponse === true) return false;
          new Response(res, { affectedRows: r.affectedRows }).OK();
        }
      } catch (err) {
        console.error(err);
        conn.rollback();
        new Response(res).internalServerError();
      } finally {
        if (!connectionProvided) conn.release();
      }
    },
  },
  skills: {
    addSkill(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.skill_name === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          SKILLS(
            ACCOUNT_UUID,
            SKILL_NAME
          )
          VALUES(
            '${data.account_uuid}',
            '${data.skill_name}'
          )
      `;
      query(res, sql);
    },
    getSkill(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          SKILL_NAME
        FROM
          SKILLS
        WHERE
          ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
  },
  blueprints: {
    getBlueprint(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          ACCOUNT_UUID,
          STOCK,
          MODEL,
          IS_MADE
        FROM
          BLUEPRINTS
        WHERE 1=1
          AND _IS_DELETED = 0
          AND ACCOUNT_UUID = '${data.account_uuid}'
          ${data.model !== undefined ? "AND MODEL = '" + data.model + "'" : ""}
      `;
      query(res, sql);
    },
    async setBlueprint(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined ||
        data.stock === undefined ||
        data.model === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          BLUEPRINTS
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${data.stock !== undefined ? ", STOCK = " + data.stock : ""}
          ${data.is_made !== undefined ? ", IS_MADE = " + data.is_made : ""}
        WHERE 1=1
          AND _IS_DELETED = 0
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND MODEL = '${data.model}'
      `;
      let r = await query(null, sql);
      if (r.affectedRows === 0) {
        query(
          res,
          `
            INSERT INTO
              BLUEPRINTS(ACCOUNT_UUID, STOCK, MODEL)
            VALUES(
              '${data.account_uuid}',
              '${data.stock}',
              '${data.model}'
            )
          `
        );
      } else {
        new Response(res, r.affectedRows).OK();
      }
    },
    async addBlueprint(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined ||
        data.stock === undefined ||
        data.model === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          BLUEPRINTS
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${
            data.stock !== undefined
              ? ", STOCK = (SELECT * FROM (SELECT IFNULL(STOCK,0) + " +
                data.stock +
                " FROM BLUEPRINTS WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "' AND MODEL = '" +
                data.model +
                "') as a)"
              : ""
          }
        WHERE 1=1
          AND _IS_DELETED = 0
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND MODEL = '${data.model}'
      `;
      let r = await query(null, sql);
      if (r.affectedRows === 0) {
        query(
          res,
          `
            INSERT INTO
              BLUEPRINTS(ACCOUNT_UUID, STOCK, MODEL)
            VALUES(
              '${data.account_uuid}',
              '${data.stock}',
              '${data.model}'
              )
            `
        );
      } else {
        new Response(res, r.affectedRows).OK();
      }
    },
    async getCurrentAndMaxBlueprintCount(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          MODEL,
          STOCK
        FROM
          BLUEPRINTS
        WHERE 1=1
          AND _IS_DELETED = 0
          AND ACCOUNT_UUID = '${data.account_uuid}'
          ${data.model !== undefined ? `AND MODEL = '${data.model}'` : ""}
      `;
      let r = await query(null, sql);
      function seriesalize(str) {
        let series = "";
        for (let s of str.split("-")) {
          series += s;
        }
        return series.substring(0, series.indexOf("("));
      }
      if (data.model !== undefined) {
        let model = data.model;
        let series = seriesalize(model);
        let MAX = _BLUEPRINT[series];
        let STOCK = r.length === 0 ? 0 : r[0]["STOCK"];
        new Response(res, { MODEL: model, STOCK, MAX }).OK();
      } else {
        let responseArray = [];
        for (let rr of r) {
          let exists = false;
          for (let name of Object.keys(_BLUEPRINT)) {
            if (seriesalize(rr.MODEL) === name) {
              exists = true;
              responseArray.push({
                MODEL: rr.MODEL,
                STOCK: rr.STOCK,
                MAX: _BLUEPRINT[name],
              });
            }
          }
        }
        new Response(res, responseArray).OK();
      }
    },
  },
  achievement: {
    getRewardInfoJSON(res) {
      let data = res.locals.data;
      if (data.name !== undefined) {
        new Response(res, _ACHIEVEMENT_REWARD[data.name]).OK();
      } else {
        new Response(res, _ACHIEVEMENT_REWARD).OK();
      }
    },
    async achievementAttained(res) {
      let data = res.locals.data;
      if (
        data.account_uuid === undefined ||
        data.name === undefined ||
        data.amount === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          ACHIEVEMENTS
        SET
          PROGRESS = (SELECT * FROM (SELECT IFNULL(PROGRESS,0) FROM ACHIEVEMENTS WHERE ACCOUNT_UUID = '${data.account_uuid}' AND NAME = '${data.name}') AS A)+${data.amount}
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND NAME = '${data.name}'
      `;
      let r = await query(null, sql);
      if (r.affectedRows === 0) {
        let rr = await query(
          null,
          `
            INSERT INTO
              ACHIEVEMENTS(ACCOUNT_UUID, NAME, PROGRESS)
            VALUES ('${data.account_uuid}','${data.name}',${data.amount})
          `
        );
        // await query(res, sql);
        new Response(res, { affectedRows: rr.affectedRows }).OK();
      } else {
        new Response(res, { affectedRows: r.affectedRows }).OK();
      }
    },
    async getAchievementProgressAndMaxCount(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          PROGRESS,
          NAME,
          IFNULL(GOT_REWARD, 0) "GOT_REWARD"
        FROM
          ACHIEVEMENTS
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          ${data.name !== undefined ? `AND NAME = '${data.name}'` : ""}
      `;
      let r = await query(null, sql);
      if (data.name !== undefined && r.length === 0) {
        r.push({
          PROGRESS: 0,
          NAME: data.name,
          MAX: _ACHIEVEMENT_COUNT[data.name],
          GOT_REWARD: 0,
        });
        new Response(res, r).OK();
        return false;
      } else if (data.name === undefined) {
        let responseArray = [];
        for (let name of Object.keys(_ACHIEVEMENT_COUNT)) {
          let exists = false;
          for (let rr of r) {
            if (rr.NAME === name) {
              exists = true;
              responseArray.push({
                PROGRESS: rr.PROGRESS,
                NAME: name,
                MAX: _ACHIEVEMENT_COUNT[name],
                GOT_REWARD: rr.GOT_REWARD,
              });
            }
          }
          if (!exists) {
            responseArray.push({
              PROGRESS: 0,
              NAME: name,
              MAX: _ACHIEVEMENT_COUNT[name],
              GOT_REWARD: 0,
            });
          }
        }
        new Response(res, responseArray).OK();
      } else {
        let flag = true;
        for (let row of r) {
          try {
            row.MAX = _ACHIEVEMENT_COUNT[row.NAME];
          } catch (e) {
            flag = false;
          }
        }
        if (flag) new Response(res, r).OK();
        else
          new Response(res).internalServerError(
            _NAMESPACE.RES_MSG.JSON_NO_SUCH_KEY
          );
      }
    },
    async claimAchievementReward(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.name === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let reward = _ACHIEVEMENT_REWARD[data.name];
      if (reward === undefined) {
        new Response(res).badRequest("해당 업적에 대한 정보 없음");
        return false;
      }

      let queryArray = [];
      res.locals.data.account_uuid = data.account_uuid;
      res.locals.data.gold =
        reward["Gold"] !== undefined ? reward["Gold"] : undefined;
      res.locals.data.chip =
        reward["Chip"] !== undefined ? reward["Chip"] : undefined;
      res.locals.data.bolt =
        reward["Bolt"] !== undefined ? reward["Bolt"] : undefined;
      res.locals.data.ironplate =
        reward["IronPlate"] !== undefined ? reward["IronPlate"] : undefined;
      res.locals.data.hitorium =
        reward["Hitorium"] !== undefined ? reward["Hitorium"] : undefined;
      res.locals.data.electric_wire =
        reward["ElectricWire"] !== undefined
          ? reward["ElectricWire"]
          : undefined;

      res.locals.doNotResponse = true;

      let conn = await getConn();
      conn.beginTransaction();
      try {
        sql.commodities.addCommodities(res, conn);

        if (reward["SkillReward"] !== undefined) {
          if (Array.isArray(reward["SkillReward"])) {
            for (let skill of reward["SkillReward"]) {
              await executeQuery(
                `
              INSERT INTO
                SKILLS (ACCOUNT_UUID, SKILL_NAME)
              VALUES ('${data.account_uuid}','${skill}')
            `,
                conn
              );
            }
          } else {
            await executeQuery(
              `
              INSERT INTO
                SKILLS (ACCOUNT_UUID, SKILL_NAME)
              VALUES ('${data.account_uuid}','${reward["SkillReward"]}')
            `,
              conn
            );
          }
        }

        await executeQuery(
          `
        UPDATE
          ACHIEVEMENTS
        SET
          GOT_REWARD = 1
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          AND NAME = '${data.name}'
      `,
          conn
        );
        conn.commit();
        new Response(res, { result: "success" }).OK();
      } catch (err) {
        console.error(err);
        conn.rollback();
        new Response(res, { result: "fail" }).internalServerError();
      } finally {
        conn.release();
      }
    },
  },
  gameResults: {
    saveGameResult(res) {
      let data = res.locals.data;
      if (
        data.gubun === undefined ||
        data.season === undefined ||
        data.player1 === undefined ||
        data.play_time === undefined
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          GAME_RESULTS(
            IDX,
            GUBUN,
            SEASON,
            ${data.highest_round !== undefined ? "HIGHEST_ROUND," : ""}
            PLAYER1,
            ${data.player2 !== undefined ? "PLAYER2," : ""}
            ${data.winner !== undefined ? "WINNER," : ""}
            PLAY_TIME
          )
          VALUES(
            (SELECT*FROM (SELECT nextval('seq_game_result') FROM DUAL)AS A),
            '${data.gubun}',
            '${data.season}',
            ${
              data.highest_round !== undefined ? `'${data.highest_round}',` : ""
            }
            '${data.player1}',
            ${data.player2 !== undefined ? `'${data.player2}',` : ""}
            ${data.winner !== undefined ? `'${data.winner}',` : ""}
            '${data.play_time}'
          )
      `;
      query(res, sql);
    },
    getRanking(res) {
      let data = res.locals.data;
      let sql = `
        SELECT * FROM(
          SELECT @ROWNUM:=@ROWNUM+1 "RANK", A.* FROM(
            SELECT A.ICON, A.TEAM, MIN(PLAY_TIME) "PLAY_TIME", A.HIGHEST_ROUND, A.PLAYER1 "ACCOUNT_UUID" FROM(
              SELECT GR1.PLAYER1, GR1.HIGHEST_ROUND, GR1.PLAY_TIME, AC.TEAM, AC.ICON
              FROM GAME_RESULTS GR1
              JOIN ACCOUNTS AC
              ON AC.ACCOUNT_UUID = GR1.PLAYER1, (SELECT @ROWNUM:=0) AS ROWNUM
              WHERE 1=1
              ${
                data.season !== undefined
                  ? `AND GR1.SEASON = ${data.season}`
                  : ""
              }
              ${data.gubun !== undefined ? `AND GR1.GUBUN = ${data.gubun}` : ""}
              AND GR1.HIGHEST_ROUND = (SELECT MAX(HIGHEST_ROUND) FROM GAME_RESULTS GR2 WHERE GR2.PLAYER1 = GR1.PLAYER1 GROUP BY GR1.PLAYER1)) AS A
              GROUP BY PLAYER1)AS A
              ORDER BY A.HIGHEST_ROUND DESC, A.PLAY_TIME ASC) AS A
              WHERE 1=1
          ${
            data.rank_high !== undefined
              ? `AND A.RANK >= ${data.rank_high}`
              : ""
          }
          ${data.rank_low !== undefined ? `AND A.RANK <= ${data.rank_low}` : ""}
      `;
      query(res, sql);
    },
  },
  facilities: {
    unlockFacility(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined || data.facility_name === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          FACILITIES (ACCOUNT_UUID, UNLOCKED_FACILITY)
          VALUES('${data.account_uuid}','${data.facility_name}')
      `;
      query(res, sql);
    },
    getUnlockedFacility(res) {
      let data = res.locals.data;
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          UNLOCKED_FACILITY
        FROM
          FACILITIES
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
  },
  etc: {
    async enhancementSucceed(res) {
      let data = res.locals.data;
      if (
        falseIfAllTruthy(
          data.account_uuid,
          data.parts_uuid,
          !falseIfOneTruthy(
            data.gold,
            data.chip,
            data.bolt,
            data.ironplate,
            data.hitorium,
            data.electric_wire,
            data.qrd
          )
        )
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }

      let conn = await getConn();

      let sql1 = `
          UPDATE
            PARTS
          SET
            ENHANCEMENT = ENHANCEMENT + 1
          WHERE 1=1
            ${
              data.account_uuid !== undefined
                ? `AND ACCOUNT_UUID = '${data.account_uuid}'`
                : ""
            }
            ${data.gubun !== undefined ? `AND GUBUN = '${data.gubun}'` : ""}
            ${
              data.slot_using_this !== undefined
                ? `AND SLOT_USING_THIS = '${data.slot_using_this}'`
                : ""
            }
            ${
              data.parts_uuid !== undefined
                ? `AND PARTS_UUID = '${data.parts_uuid}'`
                : ""
            }
            `;
      try {
        let result = await executeQuery(sql1, conn);

        if (result.affectedRows === 0) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.PARTS_NOT_FOUND);
          return false;
        } else if (result.affectedRows === 1) {
          res.locals.doNotResponse = true;
          await sql.commodities.addCommodities(res, conn);

          conn.commit();
          new Response(res, { result: "success" }).OK();
        } else {
          throw result;
        }
      } catch (err) {
        console.error(err);
        conn.rollback();
        new Response(res, { result: "fail" }).OK();
      } finally {
        conn.release();
      }
    },
  },
};

const isAllArgsProvided = function (...args) {
  //FIXME: deprecated
  for (let arg of args) {
    if (arg === undefined || arg === "") return false;
  }
  return true;
};
const falseIfAllFalsy = function (...args) {
  for (let arg of args) {
    if (arg !== undefined || arg !== "" || arg === true) return true;
  }
  return false;
};
const falseIfAllTruthy = function (...args) {
  for (let arg of args) {
    if (arg === undefined || arg === "" || arg === false) return true;
  }
  return false;
};
const falseIfOneTruthy = function (...args) {
  for (let arg of args) {
    if (arg !== undefined || arg !== "" || arg === true) return false;
  }
  return true;
};
const falseIfOneFalsy = function (...args) {
  for (let arg of args) {
    if (arg === undefined || arg === "" || arg === false) return false;
  }
  return true;
};

module.exports = { dev, sql, handshake };

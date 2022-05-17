const _NAMESPACE = require("./_NAMESPACE.JS");
const mysql = require("mysql");
const conn = mysql.createConnection(_NAMESPACE.CONN);

const Response = require("./Response");
const { DATE } = require("mysql/lib/protocol/constants/types");

const selectSingle = function (res, sql) {
  return new Promise((resolve, reject) => {
    if (sql.substring(0, 10).includes("SELECT")) {
      //FIXME: 이러면안된다
      reject("단일행 SELECT 전용임");
      return false;
    }
    conn.query(sql, (err, result, fields) => {
      if (err) {
        console.err(_NAMESPACE.ERR, err);
      } else if (!(result.length in [0, 1])) {
        new Response(res).internalServerError();
      } else {
        new Response(
          res,
          result.affectedRows > 0
            ? { affectedRows: result.affectedRows }
            : result[0]
        ).OK();
      }
    });
  });
};
const query = function (res, sql) {
  return new Promise((resolve, reject) => {
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
              console.error(_NAMESPACE.ERR, err);
              new Response(res).internalServerError();
          }
        }
        reject(err);
      } else {
        if (res) {
          new Response(
            res,
            result.affectedRows > 0
              ? { affectedRows: result.affectedRows }
              : result
          ).OK();
        }
        resolve(result);
      }
    });
  });
};
const transaction = async function (...sqls) {
  try {
    await conn.beginTransaction();
    await Promise.all(sqls.map((sql) => query(null, sql)));
    await conn.commit();
    return true;
  } catch (e) {
    console.error(e);
    await conn.rollback();
    return false;
  }
};

const sql = {
  async test() {
    if (
      await transaction(
        `INSERT INTO
        ACCOUNTS(
          ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
        )
        VALUES(
          '123', '123', '123', '123'
        )`,
        `INSERT INTO
        ACCOUNTS(
          ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
        )
        VALUES(
          '456', '456', '456', '456'
        )`,
        `INSERT INTO
        ACCOUNTS(
          ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
        )
        VALUES(
          '789', '789', '789', '789'
        )`
      )
    ) {
      console.log(true);
    } else {
      console.log(false);
    }
  },
  accounts: {
    selectRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.account_uuid && !data.email) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid && data.email) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.UUID_OR_EMAIL);
        return false;
      }
      let sql = `
      SELECT
        ACCOUNT_UUID, EMAIL, PASSWORD, AUTH, TEAM, ICON
      FROM
        ACCOUNTS
      WHERE 1=1
        AND _IS_DELETED = 0
        AND (
          ACCOUNT_UUID = '${data.account_uuid}'
          OR EMAIL = '${data.email}'
          )
      `;
      selectSingle(res, sql);
    },
    insertRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!(data.account_uuid && data.email && data.password)) {
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
    deleteRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.account_uuid) {
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
    uuid: {
      select(argObj, res) {
        let data = null;
        try {
          data = JSON.parse(argObj.data);
        } catch (e) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        if (!data.email) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        let sql = `
        SELECT
          ACCOUNT_UUID
        FROM
          ACCOUNTS
        WHERE 1=1
          AND _IS_DELETED = 0
          AND EMAIL = '${data.email}'
        `;
        selectSingle(res, sql);
      },
    },
    password: {
      select(argObj, res) {
        let data = null;
        try {
          data = JSON.parse(argObj.data);
        } catch (e) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        if (!data.account_uuid) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        let sql = `
          SELECT
            PASSWORD
          FROM
            ACCOUNTS
          WHERE 1=1
            AND _IS_DELETED = 0
            AND ACCOUNT_UUID = '${data.account_uuid}'
        `;
        selectSingle(res, sql);
      },
      update(argObj, res) {
        let data = null;
        try {
          data = JSON.parse(argObj.data);
        } catch (e) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        if (!(data.account_uuid && data.password)) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        let sql = `
          UPDATE
            ACCOUNTS
          SET
            PASSWORD = ${data.password},
            _UPDATED_AT = NOW()
          WHERE
            1=1
            AND _IS_DELETED = 0
            AND ACCOUNT_UUID = ${data.account_uuid}
        `;
        query(res, sql);
      },
    },
    team: {
      update(argObj, res) {
        let data = null;
        try {
          data = JSON.parse(argObj.data);
        } catch (e) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
        if (!(data.account_uuid && data.team && data.icon)) {
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
  hangars: {
    select(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.account_uuid) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          SLOT_NUM,
          WEAPON_UUID_MAIN,
          WEAPON_UUID_SUB,
          PARTS_UUID_HEAD,
          PARTS_UUID_BODY,
          PARTS_UUID_ARM,
          PARTS_UUID_LEG,
          PARTS_UUID_BOOSTER,
          PARTS_UUID_CORE
        FROM
          HANGARS
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
          ${
            data.slot_num !== undefined ? "AND SLOT_NUM = " + data.slot_num : ""
          }
      `;
      query(res, sql);
    },
    insertRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.account_uuid) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          HANGARS (ACCOUNT_UUID, SLOT_NUM)
          VALUES (
            '${data.account_uuid}',
            IFNULL((SELECT A FROM (SELECT MAX(SLOT_NUM)+1 "A" FROM HANGARS WHERE ACCOUNT_UUID = '${data.account_uuid}') A),0 ))
        `;
      query(res, sql);
    },
    update(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!(data.account_uuid && data.slot_num)) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `UPDATE HANGARS SET _UPDATED_AT = CURRENT_TIMESTAMP()`;
      if (data.weapon_uuid_main)
        sql += `, WEAPON_UUID_MAIN = '${data.weapon_uuid_main}'`;
      if (data.weapon_uuid_sub)
        sql += `, WEAPON_UUID_SUB = '${data.weapon_uuid_sub}'`;
      if (data.parts_uuid_head)
        sql += `, PARTS_UUID_HEAD = '${data.parts_uuid_head}'`;
      if (data.parts_uuid_body)
        sql += `, PARTS_UUID_BODY = '${data.parts_uuid_body}'`;
      if (data.parts_uuid_arm)
        sql += `, PARTS_UUID_ARM = '${data.parts_uuid_arm}'`;
      if (data.parts_uuid_leg)
        sql += `, PARTS_UUID_LEG = '${data.parts_uuid_leg}'`;
      if (data.parts_uuid_booster)
        sql += `, PARTS_UUID_BOOSTER = '${data.parts_uuid_booster}'`;
      if (data.parts_uuid_core)
        sql += `, PARTS_UUID_CORE = '${data.parts_uuid_core}'`;
      sql += `
      WHERE 1=1
        AND ACCOUNT_UUID = '${data.account_uuid}'
        AND SLOT_NUM = '${data.slot_num}'
      `;
      query(res, sql);
    },
  },
  parts: {
    insertRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (
        !(
          data.account_uuid &&
          data.parts_uuid &&
          data.name &&
          data.gubun &&
          data.max_durability
        )
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
    select(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.account_uuid && !data.parts_uuid) {
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
          ${
            data.parts_uuid !== undefined
              ? "AND PARTS_UUID = " + data.parts_uuid
              : ""
          }
          ${
            data.account_uuid !== undefined
              ? "AND ACCOUNT_UUID = " + data.account_uuid
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
    update(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!(data.account_uuid && data.slot_using_this) && !data.parts_uuid) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          PARTS
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${data.name !== undefined ? ", NAME = " + data.name : ""}
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
              ? ", CUSTOM_COLOR_1 = " + data.custom_color_1
              : ""
          }
          ${
            data.custom_color_2 !== undefined
              ? ", CUSTOM_COLOR_2 = " + data.custom_color_2
              : ""
          }
          ${
            data.custom_color_3 !== undefined
              ? ", CUSTOM_COLOR_3 = " + data.custom_color_3
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
              ? "AND ACCOUNT_UUID = " +
                data.account_uuid +
                " AND SLOT_USING_THIS = " +
                data.slot_using_this
              : ""
          }
          ${
            data.parts_uuid !== undefined
              ? "AND PARTS_UUID = " + data.parts_uuid
              : ""
          }
          ${data.gubun !== undefined ? "AND GUBUN = " + data.gubun : ""}
      `;
      query(res, sql);
    },
    setSlot(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (!data.slot_using_this && !data.parts_uuid) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
    },
  },
};

module.exports = { sql };

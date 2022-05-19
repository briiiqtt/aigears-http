const _NAMESPACE = require("./_NAMESPACE.JS");
const mysql = require("mysql");
const conn = mysql.createConnection(_NAMESPACE.CONN);

const Response = require("./Response");

const selectSingle = function (res, sql) {
  return new Promise((resolve, reject) => {
    if (!sql.includes("SELECT")) {
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
            result.affectedRows !== undefined
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
    getAccount(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid === undefined || data.email === undefined) {
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
    addAccount(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
    delAccount(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
    // uuid: {
    //   select(argObj, res) {
    //     let data = null;
    //     try {
    //       data = JSON.parse(argObj.data);
    //     } catch (e) {
    //       new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
    //       return false;
    //     }
    //     if (!data.email) {
    //       new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
    //       return false;
    //     }
    //     let sql = `
    //     SELECT
    //       ACCOUNT_UUID
    //     FROM
    //       ACCOUNTS
    //     WHERE 1=1
    //       AND _IS_DELETED = 0
    //       AND EMAIL = '${data.email}'
    //     `;
    //     selectSingle(res, sql);
    //   },
    // },
    isPWCorrect(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
      query(null, sql).then((r) => {
        let pw = null;
        let accountUUID = null;
        try {
          pw = r[0].PASSWORD;
          accountUUID = r[0].ACCOUNT_UUID;
        } catch (e) {
          new Response(res, { isPWCorrect: 2, accountUUID }).OK();
          return false;
        }
        if (pw == data.password) {
          new Response(res, { isPWCorrect: 1, accountUUID }).OK();
        } else {
          new Response(res, { isPWCorrect: 0, accountUUID: null }).OK();
        }
      });
    },
    // setPassword(argObj, res) {
    //   let data = null;
    //   try {
    //     data = JSON.parse(argObj.data);
    //   } catch (e) {
    //     new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
    //     return false;
    //   }
    //   if (!(data.account_uuid && data.password)) {
    //     new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
    //     return false;
    //   }
    //   let sql = `
    //     UPDATE
    //       ACCOUNTS
    //     SET
    //       PASSWORD = ${data.password},
    //       _UPDATED_AT = NOW()
    //     WHERE
    //       1=1
    //       AND _IS_DELETED = 0
    //       AND ACCOUNT_UUID = ${data.account_uuid}
    //   `;
    //   query(res, sql);
    // },
    team: {
      setTeam(argObj, res) {
        let data = null;
        try {
          data = JSON.parse(argObj.data);
        } catch (e) {
          new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
          return false;
        }
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
    getRobot(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
          PARTS_UUID_WEAPON_S
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
    addRobot(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
    setRobot(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid === undefined || data.slot_num === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `UPDATE ROBOTS SET _UPDATED_AT = CURRENT_TIMESTAMP()`;
      if (data.parts_uuid_arm)
        sql += `, PARTS_UUID_ARM = '${data.parts_uuid_arm}'`;
      if (data.parts_uuid_head)
        sql += `, PARTS_UUID_HEAD = '${data.parts_uuid_head}'`;
      if (data.parts_uuid_leg)
        sql += `, PARTS_UUID_LEG = '${data.parts_uuid_leg}'`;
      if (data.parts_uuid_body)
        sql += `, PARTS_UUID_BODY = '${data.parts_uuid_body}'`;
      if (data.parts_uuid_booster)
        sql += `, PARTS_UUID_BOOSTER = '${data.parts_uuid_booster}'`;
      if (data.parts_uuid_weapon_m)
        sql += `, PARTS_UUID_WEAPON_M = '${data.parts_uuid_weapon_m}'`;
      if (data.parts_uuid_weapon_s)
        sql += `, PARTS_UUID_WEAPON_S = '${data.parts_uuid_weapon_s}'`;
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
    addParts(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
    getParts(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid === undefined || data.parts_uuid === undefined) {
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
    async setParts(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
        await query(
          null,
          `SELECT ACCOUNT_UUID FROM PARTS WHERE PARTS_UUID = '${data.parts_uuid}'`
        ).then((r) => {
          console.log(r);
          if (r[0].ACCOUNT_UUID !== data.account_uuid) {
            new Response(res).badRequest(
              _NAMESPACE.RES_MSG.IT_IS_NOT_YOUR_PARTS
            );
            flag = false;
          }
        });
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
  },
  commodities: {
    getCommodities(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        SELECT
          GOLD,
          CHIP,
          BOLT,
          IRONPLATE,
          HITORIUM,
          ELECTRIC_WIRE,
          QRD
        FROM
          COMMODITIES
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      query(res, sql);
    },
    initCommodities(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (data.account_uuid === undefined) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        INSERT INTO
          COMMODITIES(
            ACCOUNT_UUID,
            GOLD,
            CHIP,
            BOLT,
            IRONPLATE,
            HITORIUM,
            ELECTRIC_WIRE,
            QRD
          )
          VALUES('${data.account_uuid}', 0, 0, 0, 0, 0, 0, 0)
      `;
      query(res, sql);
    },
    setCommodities(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
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
    addCommodities(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      if (
        data.account_uuid === undefined ||
        !(
          data.gold ||
          data.chip ||
          data.bolt ||
          data.ironplate ||
          data.hitorium ||
          data.electric_wire ||
          data.qrd
        )
      ) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
        UPDATE
          COMMODITIES
        SET
          _UPDATED_AT = CURRENT_TIMESTAMP()
          ${
            data.gold !== undefined
              ? ", GOLD = (SELECT * FROM (SELECT GOLD + " +
                data.gold +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.chip !== undefined
              ? ", CHIP = (SELECT * FROM (SELECT CHIP + " +
                data.chip +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.bolt !== undefined
              ? ", BOLT = (SELECT * FROM (SELECT BOLT + " +
                data.bolt +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.ironplate !== undefined
              ? ", IRONPLATE = (SELECT * FROM (SELECT IRONPLATE + " +
                data.ironplate +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.hitorium !== undefined
              ? ", HITORIUM = (SELECT * FROM (SELECT HITORIUM + " +
                data.hitorium +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.electric_wire !== undefined
              ? ", ELECTRIC_WIRE = (SELECT * FROM (SELECT ELECTRIC_WIRE + " +
                data.electric_wire +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
          ${
            data.qrd !== undefined
              ? ", QRD = (SELECT * FROM (SELECT QRD + " +
                data.qrd +
                " FROM COMMODITIES WHERE ACCOUNT_UUID = '" +
                data.account_uuid +
                "') as a)"
              : ""
          }
        WHERE 1=1
          AND ACCOUNT_UUID = '${data.account_uuid}'
      `;

      query(res, sql);
    },
  },
};

module.exports = { sql };

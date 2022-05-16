const _NAMESPACE = require("./_NAMESPACE.JS");
const mysql = require("mysql");
const conn = mysql.createConnection(_NAMESPACE.CONN);

const Response = require("./Response");

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
          result.affectedRows
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
              new Response(res).badRequest(_NAMESPACE.RES_MSG.UUID_DUPLICATED);
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
            result.affectedRows ? { affectedRows: result.affectedRows } : result
          ).OK();
        }
        resolve(result);
      }
    });
  });
};
const transaction = async function (...sqls) {
  // console.log(sqls)
  try {
    await conn.beginTransaction();
    await Promise.all(sqls);
    await conn.commit();
    return true;
  } catch (e) {
    console.error(e);
    await conn.rollback();
    return false;
  }
};

const sql = {
  // test() {
  //   transaction(
  //     query(null,`INSERT INTO
  //       ACCOUNTS(
  //         ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
  //       )
  //       VALUES(
  //         '123', '123', '123', '123'
  //       )`),
  //     query(null,`INSERT INTO
  //       ACCOUNTS(
  //         ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
  //       )
  //       VALUES(
  //         '456', '456', '456', '456'
  //       )`),
  //     query(null,`INSERT INTO
  //       ACCOUNTS(
  //         ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
  //       )
  //       VALUES(
  //         '456', '456', '456', '456'
  //       )`)
  //   )//.then((r) => console.log(r));
  // },
  accounts: {
    selectRow(argObj, res) {
      let data = null;
      try {
        data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
      }
      if (!data.account_uuid && !data.email) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
      SELECT
        ACCOUNT_UUID, EMAIL, PASSWORD, AUTH, TEAM
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
      }
      if (!(data.account_uuid && data.email && data.password && data.team)) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
        return false;
      }
      let sql = `
      INSERT INTO
        ACCOUNTS(
          ACCOUNT_UUID, EMAIL, PASSWORD, TEAM
        )
        VALUES(
          '${data.account_uuid}', '${data.email}', '${data.password}', '${data.team}'
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
  },
};

module.exports = { sql };

const _NAMESPACE = require("./_NAMESPACE.JS");
const mysql = require("mysql");
const connection = mysql.createConnection(_NAMESPACE.CONN);

const Response = require("./Response");

const querySingle = async function (sql) {
  let promise = new Promise((resolve, reject) => {
    if (sql.substring(0, 10).includes("SELECT")) {
      //FIXME: 이러면안된다
      reject("단일행 SELECT 전용임");
      return false;
    }
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        reject(err);
      }
      if (!(rows.length in [0, 1])) {
        reject(rows);
      }
      resolve(rows[0]);
    });
  });
  return await promise;
};
const query = async function (sql) {
  let promise = new Promise((resolve, reject) => {
    connection.query(sql, (err, rows, fields) => {
      if (err) {
        switch (err.code) {
          case "ER_DUP_ENTRY":
            reject("pkviolate");
            break;

          default:
            reject(err);
        }
      }
      resolve(rows);
    });
  });
  return await promise;
};

const sql = {
  accounts: {
    selectRow(argObj, res) {
      try {
        let data = JSON.parse(argObj.data);
      } catch (e) {
        new Response(res).badRequest(_NAMESPACE.RES_MSG.INSUFFICIENT_VALUE);
      }
      if (!data.account_uuid) {
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
        AND ACCOUNT_UUID = '${data.account_uuid}'
      `;
      querySingle(sql)
        .then((r) => {
          if (r) new Response(res, r).OK();
          else new Response(res).notFound();
        })
        .catch((err) => {
          console.error(_NAMESPACE.ERR, err);
          new Response(res).internalServerError();
        });
    },
    insertRow(argObj, res) {
      try {
        let data = JSON.parse(argObj.data);
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
      query(sql)
        .then((r) => {
          new Response(res, { affectedRows: r.affectedRows }).OK();
        })
        .catch((err) => {
          switch (err) {
            case "pkviolate":
              new Response(res).badRequest(_NAMESPACE.RES_MSG.UUID_DUPLICATED);
              break;
            default:
              console.error(_NAMESPACE.ERR, err);
              new Response(res).internalServerError();
          }
        });
    },
    deleteRow(argObj, res) {
      try {
        let data = JSON.parse(argObj.data);
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
      query(sql)
        .then((r) => {
          new Response(res, { affectedRows: r.affectedRows }).OK();
        })
        .catch((err) => {
          console.error(_NAMESPACE.ERR, err);
          new Response(res).internalServerError();
        });
    },
    uuid: {
      select(argObj, res) {
        try {
          let data = JSON.parse(argObj.data);
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
        querySingle(sql)
          .then((r) => {
            if (r) new Response(res, r).OK();
            else new Response(res).notFound();
          })
          .catch((err) => {
            console.error(_NAMESPACE.ERR, err);
            new Response(res).internalServerError();
          });
      },
    },
    password: {
      select(argObj, res) {
        try {
          let data = JSON.parse(argObj.data);
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
        querySingle(sql)
          .then((r) => {
            if (r) new Response(res, r).OK();
            else new Response(res).notFound();
          })
          .catch((err) => {
            console.error(_NAMESPACE.ERR, err);
            new Response(res).internalServerError();
          });
      },
      update(argObj, res) {
        try {
          let data = JSON.parse(argObj.data);
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
        query(sql)
          .then((r) => {
            new Response(res, { affectedRows: r.affectedRows }).OK();
          })
          .catch((err) => {
            console.error(_NAMESPACE.ERR, err);
            new Response(res).internalServerError();
          });
      },
    },
  },
};

module.exports = { sql };

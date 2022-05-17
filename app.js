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

app.post("/add-account", (req, res) =>
  db.sql.accounts.insertRow(req.body, res)
);

app.post("/del-account", (req, res) =>
  db.sql.accounts.deleteRow(req.body, res)
);

app.post("/set-team", (req, res) => db.sql.accounts.team.update(req.body, res));

app.post("/get-hangar", (req, res) => db.sql.hangars.select(req.body, res));

app.post("/add-hangar", (req, res) => db.sql.hangars.insertRow(req.body, res));

app.post("/set-hangar", (req, res) => db.sql.hangars.update(req.body, res));

app.post("/add-parts", (req, res) => db.sql.parts.insertRow(req.body, res));

app.post("/get-parts", (req, res) => db.sql.parts.select(req.body, res));

app.post("/set-parts", (req, res) => db.sql.parts.update(req.body, res));

app.post("/get-commodities", (req, res) =>
  db.sql.commodities.select(req.body, res)
);

app.post("/init-commodities", (req, res) =>
  db.sql.commodities.insert(req.body, res)
);

app.post("/set-commodities", (req, res) =>
  db.sql.commodities.update(req.body, res)
);

app.post("/get-weapon", (req, res) => db.sql.weapons.select(req.body, res));

app.post("/add-weapon", (req, res) => db.sql.weapons.insert(req.body, res));

app.post("/set-weapon", (req, res) => db.sql.weapons.update(req.body, res));

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});
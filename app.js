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
  db.sql.accounts.getAccount(req.body, res)
);

app.post("/add-account", (req, res) =>
  db.sql.accounts.addAccount(req.body, res)
);

app.post("/del-account", (req, res) =>
  db.sql.accounts.delAccount(req.body, res)
);

app.post("/set-team", (req, res) =>
  db.sql.accounts.team.setTeam(req.body, res)
);

app.post("/get-hangar", (req, res) => db.sql.hangars.getHangar(req.body, res));

app.post("/add-hangar", (req, res) => db.sql.hangars.addHangar(req.body, res));

app.post("/set-hangar", (req, res) => db.sql.hangars.setHangar(req.body, res));

app.post("/add-parts", (req, res) => db.sql.parts.addParts(req.body, res));

app.post("/get-parts", (req, res) => db.sql.parts.getParts(req.body, res));

app.post("/set-parts", (req, res) => db.sql.parts.setParts(req.body, res));

app.post("/get-commodities", (req, res) =>
  db.sql.commodities.getCommodities(req.body, res)
);

app.post("/init-commodities", (req, res) =>
  db.sql.commodities.initCommodities(req.body, res)
);

app.post("/set-commodities", (req, res) =>
  db.sql.commodities.setCommodities(req.body, res)
);

app.post("/add-commodities", (req, res) =>
  db.sql.commodities.addCommodities(req.body, res)
);

app.post("/get-weapon", (req, res) => db.sql.weapons.getWeapon(req.body, res));

app.post("/add-weapon", (req, res) => db.sql.weapons.addWeapon(req.body, res));

app.post("/set-weapon", (req, res) => db.sql.weapons.setWeapon(req.body, res));

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

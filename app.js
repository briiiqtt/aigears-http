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

app.post("/get-account", (req, res) => {
  console.log("getAccount()");
  db.sql.accounts.getAccount(req.body, res);
});

app.post("/add-account", (req, res) => {
  console.log("addAccount()");
  db.sql.accounts.addAccount(req.body, res);
});

app.post("/del-account", (req, res) => {
  console.log("delAccount()");
  db.sql.accounts.delAccount(req.body, res);
});

app.post("/set-team", (req, res) => {
  console.log("setTeam()");
  db.sql.accounts.team.setTeam(req.body, res);
});

app.post("/get-hangar", (req, res) => {
  console.log("getHanger()");
  db.sql.hangars.getHangar(req.body, res);
});

app.post("/add-hangar", (req, res) => {
  console.log("addHangar()");
  db.sql.hangars.addHangar(req.body, res);
});

app.post("/set-hangar", (req, res) => {
  console.log("setHangar()");
  db.sql.hangars.setHangar(req.body, res);
});

app.post("/add-parts", (req, res) => {
  console.log("addParts()");
  db.sql.parts.addParts(req.body, res);
});

app.post("/get-parts", (req, res) => {
  console.log("getParts()");
  db.sql.parts.getParts(req.body, res);
});

app.post("/set-parts", (req, res) => {
  console.log("setParts()");
  db.sql.parts.setParts(req.body, res);
});

app.post("/get-commodities", (req, res) => {
  console.log("getCommodities()");
  db.sql.commodities.getCommodities(req.body, res);
});

app.post("/init-commodities", (req, res) => {
  console.log("initCommodities()");
  db.sql.commodities.initCommodities(req.body, res);
});

app.post("/set-commodities", (req, res) => {
  console.log("setCommodities()");
  db.sql.commodities.setCommodities(req.body, res);
});

app.post("/add-commodities", (req, res) => {
  console.log("addCommodities()");
  db.sql.commodities.addCommodities(req.body, res);
});

app.post("/get-weapon", (req, res) => {
  console.log("getWeapon()");
  db.sql.weapons.getWeapon(req.body, res);
});

app.post("/add-weapon", (req, res) => {
  console.log("addWeapon()");
  db.sql.weapons.addWeapon(req.body, res);
});

app.post("/set-weapon", (req, res) => {
  console.log("setWeapon()");
  db.sql.weapons.setWeapon(req.body, res);
});

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

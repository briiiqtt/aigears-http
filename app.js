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
const _NAMESPACE = require("./_NAMESPACE.js");

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

app.all("*", (req, res, next) => {
  let date = new Date();
  console.log(
    `***** REQUEST: ${req.path} `,
    req.body,
    `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`
  );
  next();
});

app.post("/get-account", (req, res) => {
  db.sql.accounts.getAccount(req.body, res);
});

app.post("/add-account", (req, res) => {
  db.sql.accounts.addAccount(req.body, res);
});

app.post("/del-account", (req, res) => {
  db.sql.accounts.delAccount(req.body, res);
});

app.post("/is-pw-correct", (req, res) => {
  db.sql.accounts.isPWCorrect(req.body, res);
});

app.post("/set-team", (req, res) => {
  db.sql.accounts.team.setTeam(req.body, res);
});

app.post("/get-robot", (req, res) => {
  db.sql.robots.getRobot(req.body, res);
});

app.post("/add-robot", (req, res) => {
  db.sql.robots.addRobot(req.body, res);
});

app.post("/set-robot", (req, res) => {
  db.sql.robots.setRobot(req.body, res);
});

app.post("/add-parts", (req, res) => {
  db.sql.parts.addParts(req.body, res);
});

app.post("/get-parts", (req, res) => {
  db.sql.parts.getParts(req.body, res);
});

app.post("/set-parts", (req, res) => {
  db.sql.parts.setParts(req.body, res);
});

app.post("/get-commodities", (req, res) => {
  db.sql.commodities.getCommodities(req.body, res);
});

app.post("/init-commodities", (req, res) => {
  db.sql.commodities.initCommodities(req.body, res);
});

app.post("/set-commodities", (req, res) => {
  db.sql.commodities.setCommodities(req.body, res);
});

app.post("/add-commodities", (req, res) => {
  db.sql.commodities.addCommodities(req.body, res);
});

app.post("/add-skill", (req, res) => {
  db.sql.skills.addSkill(req.body, res);
});

app.post("/get-skill", (req, res) => {
  db.sql.skills.getSkill(req.body, res);
});

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

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
  console.log("getAccount()",req.body);
  db.sql.accounts.getAccount(req.body, res);
});

app.post("/add-account", (req, res) => {
  console.log("addAccount()",req.body);
  db.sql.accounts.addAccount(req.body, res);
});

app.post("/del-account", (req, res) => {
  console.log("delAccount()",req.body);
  db.sql.accounts.delAccount(req.body, res);
});

app.post("/set-team", (req, res) => {
  console.log("setTeam()",req.body);
  db.sql.accounts.team.setTeam(req.body, res);
});

app.post("/get-robot", (req, res) => {
  console.log("getRobot()",req.body);
  db.sql.robots.getRobot(req.body, res);
});

app.post("/add-robot", (req, res) => {
  console.log("addRobot()",req.body);
  db.sql.robots.addRobot(req.body, res);
});

app.post("/set-robot", (req, res) => {
  console.log("setRobot()",req.body);
  db.sql.robots.setRobot(req.body, res);
});

app.post("/add-parts", (req, res) => {
  console.log("addParts()",req.body);
  db.sql.parts.addParts(req.body, res);
});

app.post("/get-parts", (req, res) => {
  console.log("getParts()",req.body);
  db.sql.parts.getParts(req.body, res);
});

app.post("/set-parts", (req, res) => {
  console.log("setParts()",req.body);
  db.sql.parts.setParts(req.body, res);
});

app.post("/get-commodities", (req, res) => {
  console.log("getCommodities()",req.body);
  db.sql.commodities.getCommodities(req.body, res);
});

app.post("/init-commodities", (req, res) => {
  console.log("initCommodities()",req.body);
  db.sql.commodities.initCommodities(req.body, res);
});

app.post("/set-commodities", (req, res) => {
  console.log("setCommodities()",req.body);
  db.sql.commodities.setCommodities(req.body, res);
});

app.post("/add-commodities", (req, res) => {
  console.log("addCommodities()",req.body);
  db.sql.commodities.addCommodities(req.body, res);
});

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

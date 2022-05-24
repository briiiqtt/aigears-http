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
const { route } = require("express/lib/application");
const router = express.Router();

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

let requestNum = 0;

// app.get("/favicon.ico", (req, res, next) => {
//   res.end();
// });

app.use((req, res, next) => {
  let date = new Date();
  res.append("requestNum", requestNum);
  requestNum++;
  console.log(
    res.get("requestNum") +
      " <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" +
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDay() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds() +
      ":" +
      date.getMilliseconds() +
      "\r\n**REQUEST: " +
      req.path +
      "\r\n**body: ",
    req.body
  );
  next();
});

app.get("/test", (req, res) => {
  db.sql.test();
});
app.get("/testdownload", (req, res) => {
  res.download(__dirname + "/test.html");
  res.write(req.params);
  res.end();
});

app.use("/", router);

router.post("/get-account", (req, res) => {
  db.sql.accounts.getAccount(req.body, res);
});

router.post("/add-account", (req, res) => {
  db.sql.accounts.addAccount(req.body, res);
});

router.post("/del-account", (req, res) => {
  db.sql.accounts.delAccount(req.body, res);
});

router.post("/is-pw-correct", (req, res) => {
  db.sql.accounts.isPWCorrect(req.body, res);
});

router.post("/set-team", (req, res) => {
  db.sql.accounts.team.setTeam(req.body, res);
});

router.post("/get-robot", (req, res) => {
  db.sql.robots.getRobot(req.body, res);
});

router.post("/add-robot", (req, res) => {
  db.sql.robots.addRobot(req.body, res);
});

router.post("/set-robot", (req, res) => {
  db.sql.robots.setRobot(req.body, res);
});

router.post("/set-profile", (req, res) => {
  db.sql.robots.setProfile(req.body, res);
});

router.post("/get-profile", (req, res) => {
  db.sql.robots.getProfile(req.body, res);
});

router.post("/set-robot-record", (req, res) => {
  db.sql.robots.setRobotRecord(req.body, res);
});

router.post("/add-parts", (req, res) => {
  db.sql.parts.addParts(req.body, res);
});

router.post("/get-parts", (req, res) => {
  db.sql.parts.getParts(req.body, res);
});

router.post("/set-parts", (req, res) => {
  db.sql.parts.setParts(req.body, res);
});

router.post("/get-commodities", (req, res) => {
  db.sql.commodities.getCommodities(req.body, res);
});

router.post("/init-commodities", (req, res) => {
  db.sql.commodities.initCommodities(req.body, res);
});

router.post("/set-commodities", (req, res) => {
  db.sql.commodities.setCommodities(req.body, res);
});

router.post("/add-commodities", (req, res) => {
  db.sql.commodities.addCommodities(req.body, res);
});

router.post("/add-skill", (req, res) => {
  db.sql.skills.addSkill(req.body, res);
});

router.post("/get-skill", (req, res) => {
  db.sql.skills.getSkill(req.body, res);
});

router.post("/get-blueprint", (req, res) => {
  db.sql.blueprints.getBlueprint(req.body, res);
});

router.post("/set-blueprint", (req, res) => {
  db.sql.blueprints.setBlueprint(req.body, res);
});

router.post("/add-blueprint", (req, res) => {
  db.sql.blueprints.addBlueprint(req.body, res);
});

router.post("/get-current-and-max-blueprint-count", (req, res) => {
  db.sql.blueprints.getCurrentAndMaxBlueprintCount(req.body, res);
});

router.post("/get-reward-info-json", (req, res) => {
  db.sql.achievement.getRewardInfoJSON(req.body, res);
});

router.post("/claim-achievement-reward", (req, res) => {
  db.sql.achievement.claimAchievementReward(req.body, res);
});

router.post("/get-achievement-progress-and-max-count", (req, res) => {
  db.sql.achievement.getAchievementProgressAndMaxCount(req.body, res);
});

//
//

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

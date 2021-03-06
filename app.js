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
const router = express.Router();

const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1000,
  })
);

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

let requestNum = 0;

app.get("/favicon.ico", (req, res) => {
  res.end();
});

// 220604_added_by_ql
setInterval(function () {
  db.handshake();
}, 14400000);

app.post("*", (req, res, next) => {
  let date = new Date();
  res.append("requestNum", requestNum);
  requestNum++;
  try {
    res.locals.data = JSON.parse(req.body.data);
    console.log(
      "REQUEST " +
        res.get("requestNum") +
        "  |  " +
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds() +
        ":" +
        date.getMilliseconds() +
        "  | " +
        req.path +
        "\r\n",
      res.locals.data
    );
  } catch (e) {
    console.error(e);
    new Response(res).badRequest("json파싱 실패");
    return false;
  }
  next();
});

app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/test.html");
});

app.get("/test-ranking", (req, res) => {
  res.sendFile(__dirname + "/test-ranking.html");
});

app.post("/testpost", (req, res) => {});

app.use("/", router);

router.post("/get-account", (req, res) => {
  db.sql.accounts.getAccount(res);
});

router.post("/set-facility-phase", (req, res) => {
  db.sql.accounts.setFacilityPhase(res);
});

router.post("/add-account", (req, res) => {
  db.sql.accounts.addAccount(res);
});

router.post("/del-account", (req, res) => {
  db.sql.accounts.delAccount(res);
});

router.post("/is-pw-correct", (req, res) => {
  db.sql.accounts.isPWCorrect(res);
});

router.post("/set-team", (req, res) => {
  db.sql.accounts.team.setTeam(res);
});

router.post("/get-robot", (req, res) => {
  db.sql.robots.getRobot(res);
});

router.post("/add-robot", (req, res) => {
  db.sql.robots.addRobot(res);
});

router.post("/set-robot", (req, res) => {
  db.sql.robots.setRobot(res);
});

router.post("/delete-robot", (req, res) => {
  db.sql.robots.deleteRobot(res);
});

router.post("/set-profile", (req, res) => {
  db.sql.robots.setProfile(res);
});

router.post("/get-profile", (req, res) => {
  db.sql.robots.getProfile(res);
});

router.post("/set-robot-record", (req, res) => {
  db.sql.robots.setRobotRecord(res);
});

router.post("/add-parts", (req, res) => {
  db.sql.parts.addParts(res);
});

router.post("/get-parts", (req, res) => {
  db.sql.parts.getParts(res);
});

router.post("/set-parts", (req, res) => {
  db.sql.parts.setParts(res);
});

router.post("/delete-parts", (req, res) => {
  db.sql.parts.deleteParts(res);
});

router.post("/get-commodities", (req, res) => {
  db.sql.commodities.getCommodities(res);
});

router.post("/init-commodities", (req, res) => {
  db.sql.commodities.initCommodities(res);
});

router.post("/set-commodities", (req, res) => {
  db.sql.commodities.setCommodities(res);
});

router.post("/add-commodities", (req, res) => {
  db.sql.commodities.addCommodities(res);
});

router.post("/add-skill", (req, res) => {
  db.sql.skills.addSkill(res);
});

router.post("/get-skill", (req, res) => {
  db.sql.skills.getSkill(res);
});

router.post("/get-blueprint", (req, res) => {
  db.sql.blueprints.getBlueprint(res);
});

router.post("/set-blueprint", (req, res) => {
  db.sql.blueprints.setBlueprint(res);
});

router.post("/add-blueprint", (req, res) => {
  db.sql.blueprints.addBlueprint(res);
});

router.post("/get-current-and-max-blueprint-count", (req, res) => {
  db.sql.blueprints.getCurrentAndMaxBlueprintCount(res);
});

router.post("/get-reward-info-json", (req, res) => {
  db.sql.achievement.getRewardInfoJSON(res);
});

router.post("/achievement-attained", (req, res) => {
  db.sql.achievement.achievementAttained(res);
});

router.post("/get-achievement-progress-and-max-count", (req, res) => {
  db.sql.achievement.getAchievementProgressAndMaxCount(res);
});

router.post("/claim-achievement-reward", (req, res) => {
  db.sql.achievement.claimAchievementReward(res);
});

router.post("/save-game-result", (req, res) => {
  db.sql.gameResults.saveGameResult(res);
});

router.post("/get-ranking", (req, res) => {
  db.sql.gameResults.getRanking(res);
});

router.post("/enhancement-succeed", (req, res) => {
  db.sql.etc.enhancementSucceed(res);
});

router.post("/unlock-facility", (req, res) => {
  db.sql.facilities.unlockFacility(res);
});

router.post("/get-unlocked-facility", (req, res) => {
  db.sql.facilities.getUnlockedFacility(res);
});

//
//
router.post("/haejo", (req, res) => {
  db.dev.haejo(res);
});

app.get("/", (req, res) => {
  res.send(true);
});
app.post("/server-down", (req, res) => {
  process.exit(0);
});
app.post("/server-crash", (req, res) => {
  throw "hi";
});

app.all("*", (req, res) => {
  new Response(res).notFound(_NAMESPACE.RES_MSG.NO_SUCH_PATH);
});

function hi() {
  try {
    throw "hi";
  } catch (err) {
    console.log("catch");
    return;
  } finally {
    console.error("asd");
  }
}

const express = require("express");
const app = express();
const Response = require("./Response");

app.use(express.json(), (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    new Response(res).badRequest();
  } else {
    next();
  }
});
app.use(express.urlencoded({ extended: false }));

const db = require("./DB");

app.listen((port = 52530), () => {
  console.log(`server started, port: ${port}`);
});

app.route('/test').get((req,res)=>{
	console.log('asdfasdfasdfasdf');
	res.send('hi')
	});

app
  .route("/accounts")
  .get((req, res) => db.sql.accounts.select(req.query, res)) //?account_uuid=계정uuid
  .post((req, res) => db.sql.accounts.insert(req.body, res)) //{"account_uuid":"계정uuid","email":"이메일","password":"비밀번호","team":"소속"}
  .put((req, res) => new Response(res).methodNotAllowed())
  .delete((req, res) => new Response(res).methodNotAllowed());

app
  .route("/accounts/uuid")
  .get((req, res) => db.sql.accounts.uuid.select(req.query, res)) //?account_uuid=계정uuid
  .post((req, res) => new Response(res).methodNotAllowed())
  .put((req, res) => new Response(res).methodNotAllowed())
  .delete((req, res) => new Response(res).methodNotAllowed());

app
  .route("/accounts/password")
  .get((req, res) => db.sql.accounts.password.select(req.query, res)) //?account_uuid=계정uuid
  .post((req, res) => new Response(res).methodNotAllowed())
  .put((req, res) => db.sql.accounts.password.update(req.body, res)) //{"account_uuid":"계정uuid","password":"비밀번호"}
  .delete((req, res) => new Response(res).methodNotAllowed());

app.all("*", (req, res) => {
  new Response(res).notFound();
});

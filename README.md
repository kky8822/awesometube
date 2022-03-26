# Awesometube

## 환경설정

- git설정 및 사용법

```c
mkdir awesometube
cd awesometube
git init
github에서 repository 만들기
git remote add origin https://github.com/kky8822/awesometube

git add .   //업데이트된 파일 staging 영역 추가
git status  //staging 영역 확인
git commit -m <commit이름>
git push origin master

```

- nodejs

```c
brew install nodejs // nodejs 설치
npm init            // package.json 자동작성
```

- nodemon 및 babel

```c
npm i nodemon       // nodemon 설치
npm i --save-dev @babel/core @babel/node @babel/preset-env --save-dev // bable 설치
```

```c
// babel.config.js 작성
{
   "presets": ["@babel/preset-env"]
}
```

```c
// nodemon.json 작성
{
   "ignore": [],
   "exec": "babel-node src/init.js"
}
```

```c
// package.json 수정
"scripts": { "dev:server": "nodemon" }
```

- express설치

```c
npm i express
```

- pug view enging

```c
npm i pug
```

```c
import express from "express";
const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
```

- morgan: server 확인 middleware

```c
npm i morgan
```

```c
const logger = morgan("dev");
app.use(logger);
```

- multer: file handle

```c
//설치
npm i multer
```

- express-session: session control

```c
//설치
npm i express-session
```

- connect-mongo

```c
//설치
npm i connect-mongo
```

- cross-fetch

```c
npm i cross-fetch
```

## architecture 구성

init.js: server open  
server.js: server 객체 생성

Routers, controllers, views

- rootRouter:{home, join, login, search,}
- usersRouter:{logout, profile, edit, change-password, github-login,}
- videosRouter:{ watch, edit, delete, upload,}

## 기본 router/controller/views 조합

```c
//server.js
rootRouter.route("/").get(getHome).post(postHome)
```

```c
//controllers.js
export const getHome = (req, res) => { res.render("home", {pageTitle: "Home"});}
```

## Middleware

server.js에서 사전에 거쳐가도록 설정.  
res.locals에 객체생성시, pug view에서 사용 가능.

```c
//middlewears.js
export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Awesometube";
  next();
};
```

```c
//server.js
app.use(localsMiddlewear);
```

```c
//*.pug
title #{siteName}
```

## pug

- MVP styler

```c
//*.pug
link(rel="stylesheet" href="https://unpkg.com/mvp.css")
```

- partials

```c
//footer.pug
footer &copy; #{new Date().getFullYear()} Awesometube
```

```c
//*.pug
include partials/footer.pug
```

- mixin

```c
//video.pug
mixin video(video)
    div
        h4
            a(href=`/videos/${video.id}`)=video.title
        p=video.description
        ul
            each hashtag in video.hashtags
                li=hashtag
        small=video.createdAt
        hr
```

```c
//home.pug
+video(video)
```

## MongoDB: JSON like database (not sql)

```c
//설치
xcode-select --install
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0 //start mongodb
brew services stop mongodb-community@5.0  /stop mongodb

//확인 및 실행
mongod
mongo

show dbs
use awesometube
show collections
db.users.find()
db.users.remove({})
```

## Mongoose

```c
//설치
npm i mongoose
```

```c
//User.js: model
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({...}); // model Schema
userSchema.pre("save", async function () {});  // static function
const user = mongoose.model("User", userSchema); // model 저장
export default user;
```

## Join

POST: data post to backend.  
file: multer  
MongDB & Mongoose model  
bcrypt: hashing middle wear

- form 이해 위한 express encoding

```c
//server.js
app.use(express.urlencoded({extended:true}))
```

- multer middlewear

```c
//middlewear.js
import multer from "multer"
export const avatarUpload = multer({dest: "uploads/avatars"})
```

- get으로 join 접근, post로 data 수집, avatarUpload middlewear로 파일 저장

```c
//rootRouter.js
import {avatarUpload} from "./middlewears"
rootRouter.route("/join").get(getJoin).post(avatarUpload.single("avatar"), postJoin)
```

- data "POST" to req.body, file 이해 위한 encoding type 설정

```c
//join.pug
form(method="POST", enctype="multipart/form-data")
```

- posted data MongoDB 저장

```c
//userControllers.js
import User from "../model/User";

export const postJoin = async (res, rea) => {
  const { file:{path: avatarUrl}
          body: {username, email, password, password_c}} = req;
  await User.create({avatarUrl, username, email, password});
};
```

- password hashing middlewear

```c
// model/User.js
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});
```

## Login

- mongoose findOne, exists
- bcrypt: compare
- express-session: session middleware
- client가 server 접속시, session id를 자동으로 resposne하며 이는 client측 cookie와 backend측 sessioin DB에 저장 (by mongo-store)되어 이를 비교하여 backend에서 누가 누구인지 구분 가능 및 session obj에 정보 추가 가능
- req.session에 로그인 정보 추가
- res.locals에 로그인 정보 추가 --> template에서 사용

```c
//server.js
import session from "express-session";

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,            // resave, saveUninitialized
    saveUninitialized: false, // session이 수정되었을때만 DB에 저장 (session.loggedIn, session.user, 로그인 되었을때만)
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
```

```c
//userControllers.js
const user = await User.findOne({ username });
const ok = await bcrypt.compare(password, user.password); // 순서 password --> hash

req.session.loggedIn = true; //session에 로그인 정보 추가
req.session.user = user;
```

```c
//middlewears.js localsMiddlewear
res.locals.loggedIn = Boolean(req.session.loggedIn);
res.locals.loggedInUser = req.session.user || {};
```

## Logout

```c
//userControllers.js
export const getLogout = (req, res) => {
  req.session.detroy();
  return res.redirect("/");
}
```

## OAuth - Github login

- https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
- Github OAuth 등록: Settings->Developer settings->OAuth app->New OAuth App
- usersRouter.js
  ```c
  userRouter.get("/github/start", startGithubLogin);
  userRouter.get("/github/finish", finishGithubLogin);
  ```
- startGithubLogin: scope 정의 및 code 요청

  ```c
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email", // 요청 data
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  return res.redirect(finalUrl);
  ```

- finishGithubLogin

  ```c
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;  // token 요청 Url

  // token 요청 fetch
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();


  if ("access_token" in tokenRequest) {
    // "access_token"으로 api에 data 요청 fetch
    const { access_token } = tokenRequest;
    const userData = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    // 회원 아니면 자동 회원가입
    if (!user) {
      user = await User.create({
        email: emailObj.email,
        username: userData.login,
        password: "",
        socialOnly: true,
        avatarUrl: userData.avatar_url,
      });
    }
    // 로그인
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
  } else {
    return res.redirect("/login");
  }
  ```

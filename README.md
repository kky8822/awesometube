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
file: multer.
MongDB & Mongoose model

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

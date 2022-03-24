import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import usersRouter from "./routers/usersRouter";
import videosRouter from "./routers/videosRouter";
import { localsMiddleware } from "./middlewears";
import morgan from "morgan";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

export default app;

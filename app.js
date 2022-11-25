const { config } = require("dotenv");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const i18n = require("i18n");
const logger = require("morgan");

i18n.configure({
  locales: ["en", "de"],
  cookie: "locale",
  defaultLocale: "en",
  directory: path.join(__dirname, "/locales"),
});

const indexRouter = require("./routes/index");
const pointsRouter = require("./routes/points");
const isochroneRouter = require("./routes/isochrone");

const app = express();

app.use(function (req, res, next) {
  // express helper for natively supported engines
  res.locals.__ = res.__ = function () {
    return i18n.__.apply(req, arguments);
  };
  next();
});

config();

const STATIC_BASE = process.env.BASE === "/" ? "" : process.env.BASE;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(i18n.init);
app.use(`${STATIC_BASE}`, express.static(path.join(__dirname, "public")));

app.use(`${STATIC_BASE}/`, indexRouter);
app.use(`${STATIC_BASE}/points`, pointsRouter);
app.use(`${STATIC_BASE}/isochrone`, isochroneRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
  next();
});

module.exports = app;

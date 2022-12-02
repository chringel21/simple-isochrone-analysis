/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 |
 | There are more options than you see here, these are just the ones that are
 | set internally. See the website for more info.
 |
 |
 */

var { config } = require("dotenv");

config();

module.exports = {
  proxy: `localhost:${process.env.PORT}`,
  files: ["./views/**/*.pug"],
  ignore: ["node_modules"],
  reloadDelay: 10,
  ui: false,
  notify: false,
  port: 3000,
};

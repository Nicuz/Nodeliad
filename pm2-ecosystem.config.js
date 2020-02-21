module.exports = {
  apps : [{
    name        : "iliad bot",
    script      : "./dist/bot.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
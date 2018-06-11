module.exports = {
  apps : [{
    name        : "iliad bot",
    script      : "./bot.js",
    watch       : true,
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
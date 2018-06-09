const Telegraf = require('telegraf')
const nodeliad = require('./nodeliad')
var config = require('./config.json');

const bot = new Telegraf(config.telegram.token)

var intestatario, credito, chiamate, sms, mms, dati;

nodeliad.login(function(html){
  if (html == "Errore durante il login. ID utente o password non corretto.") {
    console.log(">",html,"\n> Il bot NON verrà avviato.");
    process.exit();
  } else {
    console.log("> Bot avviato.");
  }
})

bot.on('text', (ctx) => {
  if (config.telegram.username === ctx.message.from.username) {
    switch (ctx.message.text) {

      case '/start':
        nodeliad.login(function(html){
          intestatario = nodeliad.info_linea(html)[0];
          ctx.replyWithMarkdown("Ciao *"+intestatario+"*, hai effettuato con successo il login al sito di Iliad! 😄\n\nCon questo bot potrai controllare tutti i consumi relativi alla tua tariffa, ecco la lista dei comandi disponibili:\n💰 /credito per conoscere il credito residuo\n🇮🇹 /consumi per conoscere i consumi effettuati in Italia\n🌎 /consumiestero per conoscere i consumi effettuati all'estero");
        })
        break

      case '/credito':
        nodeliad.login(function(html){
          credito = nodeliad.info_linea(html)[3];
          ctx.replyWithMarkdown("Hai un credito residuo di *"+credito+"*");
        })
        break

      case '/consumi':
        nodeliad.login(function(html){
          minuti = nodeliad.consumi_italia(html)[0];
          sms = nodeliad.consumi_italia(html)[1];
          mms = nodeliad.consumi_italia(html)[2];
          dati = nodeliad.consumi_italia(html)[3];
          ctx.replyWithMarkdown("📞 *"+minuti+"*\n💬 *"+sms+"* SMS\n✉️ *"+mms+"* MMS\n📶 *"+dati+"*")
        })
        break

      case '/consumiestero':
      nodeliad.login(function(html){
        minuti = nodeliad.consumi_estero(html)[0];
        sms = nodeliad.consumi_estero(html)[1];
        mms = nodeliad.consumi_estero(html)[2];
        dati = nodeliad.consumi_estero(html)[3];
        ctx.replyWithMarkdown("📞 *"+minuti+"*\n💬 *"+sms+"* SMS\n✉️ *"+mms+"* MMS\n📶 *"+dati+"*")
      })
        break

      default:
        ctx.reply('Comando non riconosciuto');
    }
  } else {
    ctx.reply('E tu chi cazzo sei? Non sei autorizzato ad eseguire comandi.');
  }
})

bot.startPolling()

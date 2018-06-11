const Telegraf = require('telegraf')
const nodeliad = require('./nodeliad')
var config = require('./config.json');

const bot = new Telegraf(config.telegram.token)

var intestatario, credito, chiamate, sms, mms, dati, dati_extra;

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
          intestatario = nodeliad.info_linea(html).intestatario;
          ctx.replyWithMarkdown(`Ciao *${intestatario}*, hai effettuato con successo il login al sito di Iliad! 😄\n\nCon questo bot potrai controllare tutti i consumi relativi alla tua tariffa, ecco la lista dei comandi disponibili:\n💰 /credito per conoscere il credito residuo\n🇮🇹 /consumi per conoscere i consumi effettuati in Italia\n🌎 /consumiestero per conoscere i consumi effettuati all'estero\n💶 /costiextra per controllare i costi extra in Italia\n💵 /costiextraestero per controllare consumi e costi extra all'estero`);
        })
        break

      case '/credito':
        nodeliad.login(function(html){
          credito = nodeliad.info_linea(html).credito;
          ctx.replyWithMarkdown(`Hai un credito residuo di ${credito}`);
        })
        break

      case '/consumi':
        nodeliad.login(function(html){
          minuti = nodeliad.consumi_italia(html).chiamate_effettuate_minuti;
          sms = nodeliad.consumi_italia(html).sms_inviati;
          mms = nodeliad.consumi_italia(html).mms_inviati;
          dati = nodeliad.consumi_italia(html).dati_utilizzati;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* SMS\n✉️ *${mms}* MMS\n📶 *${dati}*`)
        })
        break

      case '/consumiestero':
        nodeliad.login(function(html){
          minuti = nodeliad.consumi_estero(html).chiamate_effettuate_minuti;
          sms = nodeliad.consumi_estero(html).sms_inviati;
          mms = nodeliad.consumi_estero(html).mms_inviati;
          dati = nodeliad.consumi_estero(html).dati_utilizzati;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* SMS\n✉️ *${mms}* MMS\n📶 *${dati}*`)
        })
        break

      case '/costiextra':
        nodeliad.login(function(html){
          minuti = nodeliad.consumi_italia(html).chiamate_costi_extra;
          sms = nodeliad.consumi_italia(html).sms_costi_extra;
          mms = nodeliad.consumi_italia(html).mms_costi_extra;
          dati = nodeliad.consumi_italia(html).dati_costi_extra;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* (SMS)\n✉️ *${mms}* (MMS)\n📶 *${dati}*`)
        })
        break

      case '/costiextraestero':
        nodeliad.login(function(html){
          minuti = nodeliad.consumi_estero(html).chiamate_costi_extra;
          sms = nodeliad.consumi_estero(html).sms_costi_extra;
          mms = nodeliad.consumi_estero(html).mms_costi_extra;
          dati = nodeliad.consumi_estero(html).dati_costi_extra;
          dati_extra = nodeliad.consumi_estero(html).dati_utilizzati_extra;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* (SMS)\n✉️ *${mms}* (MMS)\n📶 *${dati}*\n📶 *${dati_extra}*`)
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

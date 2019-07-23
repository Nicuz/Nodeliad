const Telegraf = require('telegraf')
const nodeliad = require('./nodeliad')
const config = process.env.TG_TOKEN || require('./config.json');

const BOT = new Telegraf(process.env.TG_TOKEN || config.telegram.token);

var intestatario, credito, rinnovo, chiamate, sms, mms, dati, datiExtra;

nodeliad.Login(function(html){
  if (html == "Errore durante il login. ID utente o password non corretto.") {
    console.log(">",html,"\n> Il bot NON verrà avviato.");
    process.exit();
  } else {
    console.log("> Bot avviato.");
  }
});

BOT.on('text', (ctx) => {
  if (process.env.TG_USERNAME === ctx.message.from.username || config.telegram.username === ctx.message.from.username) {
    switch (ctx.message.text) {

      case '/start':
        nodeliad.Login(function(html){
          intestatario = nodeliad.InfoLinea(html).intestatario;
          ctx.replyWithMarkdown(`Ciao *${intestatario}*, hai effettuato con successo il login al sito di Iliad! 😄\n\nCon questo bot potrai controllare tutti i consumi relativi alla tua tariffa, ecco la lista dei comandi disponibili:\n💰 /info per conoscere il credito residuo\n🇮🇹 /consumi per conoscere i consumi effettuati in Italia\n🌎 /consumiestero per conoscere i consumi effettuati all'estero\n💶 /costiextra per controllare i costi extra in Italia\n💵 /costiextraestero per controllare consumi e costi extra all'estero`);
        });
        break

      case '/info':
        nodeliad.Login(function(html){
          credito = nodeliad.InfoLinea(html).credito;
          rinnovo = nodeliad.InfoLinea(html).rinnovo;
          ctx.replyWithMarkdown(`Hai un credito residuo di ${credito}\n\n${rinnovo}`);
        });
        break

      case '/consumi':
        nodeliad.Login(function(html){
          minuti = nodeliad.ConsumiItalia(html).chiamateEffettuateMinuti;
          sms = nodeliad.ConsumiItalia(html).smsInviati;
          mms = nodeliad.ConsumiItalia(html).mmsInviati;
          dati = nodeliad.ConsumiItalia(html).datiUtilizzati;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* SMS\n✉️ *${mms}* MMS\n📶 *${dati}*`)
        });
        break

      case '/consumiestero':
        nodeliad.Login(function(html){
          minuti = nodeliad.ConsumiEstero(html).chiamateEffettuateMinuti;
          sms = nodeliad.ConsumiEstero(html).smsInviati;
          mms = nodeliad.ConsumiEstero(html).mmsInviati;
          dati = nodeliad.ConsumiEstero(html).datiUtilizzati;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* SMS\n✉️ *${mms}* MMS\n📶 *${dati}*`)
        });
        break

      case '/costiextra':
        nodeliad.Login(function(html){
          minuti = nodeliad.ConsumiItalia(html).chiamateCostiExtra;
          sms = nodeliad.ConsumiItalia(html).smsCostiExtra;
          mms = nodeliad.ConsumiItalia(html).mmsCostiExtra;
          dati = nodeliad.ConsumiItalia(html).datiCostiExtra;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* (SMS)\n✉️ *${mms}* (MMS)\n📶 *${dati}*`)
        });
        break

      case '/costiextraestero':
        nodeliad.Login(function(html){
          minuti = nodeliad.ConsumiEstero(html).chiamateCostiExtra;
          sms = nodeliad.ConsumiEstero(html).smsCostiExtra;
          mms = nodeliad.ConsumiEstero(html).mmsCostiExtra;
          dati = nodeliad.ConsumiEstero(html).datiCostiExtra;
          datiExtra = nodeliad.ConsumiEstero(html).datiUtilizzatiExtra;
          ctx.replyWithMarkdown(`📞 *${minuti}*\n💬 *${sms}* (SMS)\n✉️ *${mms}* (MMS)\n📶 *${dati}*\n📶 *${datiExtra}*`)
        });
        break

      default:
        ctx.reply('Comando non riconosciuto');
    }
  } else {
    ctx.reply('Utente non autorizzato ad eseguire comandi.\nCrea il tuo bot iliad con https://github.com/albertoxamin/Nodeliad');
  }
});

BOT.startPolling();

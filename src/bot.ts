import telegraf from "telegraf";
import "./config/env";
import * as iliad from "./iliad";
import { InfoLinea } from "interfaces/infolinea";
import { ConsumiItalia } from "interfaces/consumiitalia";
import { ConsumiEstero } from "interfaces/consumiestero";

const bot = new telegraf(process.env.TELEGRAM_BOT_TOKEN);

iliad.login().then(function (response: string) {
    if (String(response).match(/ID utente o password non corretto./g) !== null) {
        console.log("> Errore durante il login");
        process.exit();
    } else {
        console.log("> Bot avviato.");
        iliad.avviaJobRinnovo(bot);
    }
});

bot.on("text", async (ctx) => {
    let infoLinea: InfoLinea;
    let consumiItalia: ConsumiItalia;
    let consumiEstero: ConsumiEstero;

    if (Number(process.env.TELEGRAM_CHATID) === ctx.message.from.id) {
        switch (ctx.message.text) {
            case "/start":
                infoLinea = await iliad.infoLinea();
                ctx.replyWithMarkdown(`Ciao *${infoLinea.intestatario}*, hai effettuato con successo il login al sito di Iliad! 😄\n\nCon questo bot potrai controllare tutti i consumi relativi alla tua tariffa, ecco la lista dei comandi disponibili:\n💰 /credito per conoscere il credito residuo\n🇮🇹 /consumi per conoscere i consumi effettuati in Italia\n🌎 /consumiestero per conoscere i consumi effettuati all'estero\n💶 /costiextra per controllare i costi extra in Italia\n💵 /costiextraestero per controllare consumi e costi extra all'estero`);
                break;

            case "/credito":
                infoLinea = await iliad.infoLinea();
                ctx.replyWithMarkdown(`💰 Hai un credito residuo di ${infoLinea.credito}\n🗓 Prossimo rinnovo il ${infoLinea.dataRinnovo} alle ${infoLinea.orarioRinnovo}`);
                break;

            case "/consumi":
                consumiItalia = await iliad.consumiItalia();
                ctx.replyWithMarkdown(`📞 *${consumiItalia.chiamate}*\n💬 *${consumiItalia.sms}* SMS\n✉️ *${consumiItalia.mms}* MMS\n📶 *${consumiItalia.datiUtilizzati}* utilizzati e *${consumiItalia.datiDisponibili}* ancora disponibili`);
                break;

            case "/consumiestero":
                consumiEstero = await iliad.consumiEstero();
                ctx.replyWithMarkdown(`📞 *${consumiEstero.chiamate}*\n💬 *${consumiEstero.sms}* SMS\n✉️ *${consumiEstero.mms}* MMS\n📶 *${consumiEstero.datiUtilizzati}* utilizzati e *${consumiEstero.datiDisponibili}* ancora disponibili`);
                break;

            case "/costiextra":
                consumiItalia = await iliad.consumiItalia();
                ctx.replyWithMarkdown(`📞 *${consumiItalia.consumiVoce}*\n💬 *${consumiItalia.smsExtra}* (SMS)\n✉️ *${consumiItalia.mmsExtra}* (MMS)\n📶 *${consumiItalia.datiExtra}*`);
                break;

            case "/costiextraestero":
                consumiEstero = await iliad.consumiEstero();
                ctx.replyWithMarkdown(`📞 *${consumiEstero.consumiVoce}*\n💬 *${consumiEstero.smsExtra}* (SMS)\n✉️ *${consumiEstero.mmsExtra}* (MMS)\n📶 *${consumiEstero.datiExtra}*`);
                break;

            default:
                ctx.reply("Comando non riconosciuto! Ecco la lista dei comandi disponibili:\n💰 /credito per conoscere il credito residuo\n🇮🇹 /consumi per conoscere i consumi effettuati in Italia\n🌎 /consumiestero per conoscere i consumi effettuati all'estero\n💶 /costiextra per controllare i costi extra in Italia\n💵 /costiextraestero per controllare consumi e costi extra all'estero");
        }
    } else {
        ctx.reply("E tu chi cazzo sei? Non sei autorizzato ad eseguire comandi.");
    }
});

bot.startPolling();
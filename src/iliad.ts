import cheerio from "cheerio";
import request from "request-promise";
import "./config/env";
import { InfoLinea } from "interfaces/infolinea";
import { ConsumiItalia } from "interfaces/consumiitalia";
import { ConsumiEstero } from "interfaces/consumiestero";
import { CronJob, CronTime } from "cron";
import moment, { Moment } from "moment";
import Telegraf, { ContextMessageUpdate } from "telegraf";

export async function login(): Promise<string> {
    const options = {
        url: "https://www.iliad.it/account/",
        method: "POST",
        followAllRedirects: true,
        jar: true,
        form: {
            "login-ident": process.env.ILIAD_USERNAME,
            "login-pwd": process.env.ILIAD_PASSWORD
        }
    };

    try {
        const res = await request(options);
        return res;
    } catch (error) {
        throw new Error(`Cheerio error: ${error}`);
    }
}

export async function infoLinea(): Promise<InfoLinea> {
    const body: string = await login();
    const $ = cheerio.load(body);

    const info: InfoLinea = {
        intestatario: $(".current-user .current-user__infos .bold").first().text(),
        id: Number($(".current-user .current-user__infos .smaller").first().text().replace("ID utente: ", "")),
        numero: Number($(".current-user .current-user__infos .smaller").last().text().replace("Numero: ", "").replace(/\s/g, "")),
        credito: $(".p-conso h2 .red").text(),
        dataRinnovo: String($(".p-conso .end_offerta").text().replace(/\s\s+|[A-zÀ-ù\s]|/g, "").match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g)),
        orarioRinnovo: String($(".p-conso .end_offerta").text().replace(/\s\s+|[A-zÀ-ù\s]|/g, "").match(/[0-9]{2}:[0-9]{2}/g))
    };

    return info;
}

export async function consumiItalia(): Promise<ConsumiItalia> {
    const body: string = await login();
    const $ = cheerio.load(body);
    const listaConsumi: Array<string> = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    $(".conso-local .conso__text .red").each(function (i: number, elem: CheerioElement) {
        listaConsumi[i] = $(this).text();
    });

    const datiDisponibili = Number($(".conso-local .conso__icon .wrapper-align .big").text());
    const unitaDatiDisponibili: string = $(".conso-local .conso__icon .wrapper-align .small").text();

    const consumi: ConsumiItalia = {
        chiamate: listaConsumi[0],
        consumiVoce: listaConsumi[1],
        sms: Number(listaConsumi[2].replace(" SMS", "")),
        smsExtra: listaConsumi[3],
        datiUtilizzati: listaConsumi[4],
        datiDisponibili: datiDisponibili + unitaDatiDisponibili,
        datiExtra: listaConsumi[5],
        mms: Number(listaConsumi[6].replace(" MMS", "")),
        mmsExtra: listaConsumi[7]
    };

    return consumi;
}

export async function consumiEstero(): Promise<ConsumiEstero> {
    const body: string = await login();
    const $ = cheerio.load(body);
    const listaConsumi: Array<string> = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    $(".conso-roaming .conso__text .red").each(function (i: number, elem: CheerioElement) {
        listaConsumi[i] = $(this).text();
    });

    const datiDisponibili = Number($(".conso-roaming .conso__icon .wrapper-align .big").text());
    const unitaDatiDisponibili: string = $(".conso-roaming .conso__icon .wrapper-align .small").text();

    const consumi: ConsumiEstero = {
        chiamate: listaConsumi[0],
        consumiVoce: listaConsumi[1],
        sms: Number(listaConsumi[2].replace(" SMS", "")),
        smsExtra: listaConsumi[3],
        datiUtilizzati: listaConsumi[4],
        datiDisponibili: datiDisponibili + unitaDatiDisponibili,
        datiExtra: listaConsumi[5],
        datiUtilizzatiExtra: listaConsumi[6].replace(/\s/g, ""),
        mms: Number(listaConsumi[7].replace(" MMS", "")),
        mmsExtra: listaConsumi[8]
    };

    return consumi;
}

export async function avviaJobRinnovo(bot: Telegraf<ContextMessageUpdate>): Promise<void> {
    let info: InfoLinea = await infoLinea();
    const dataRinnovo: Moment = moment(`${info.dataRinnovo} ${info.orarioRinnovo}`, "DD/MM/YYYY hh:mm");
    let dataAvvisoRinnovo: Moment;
    let dataAggiornamentoRinnovo: Moment;

    dataAvvisoRinnovo = dataRinnovo.clone().subtract(Number(process.env.GIORNI_AL_RINNOVO), "days");
    if (dataAvvisoRinnovo.isBefore(moment())) {
        dataAvvisoRinnovo = dataRinnovo;
    }

    const jobAvvisoRinnovo: CronJob = new CronJob({
        cronTime: dataAvvisoRinnovo,
        onTick: async function (): Promise<void> {
            await bot.telegram.sendMessage(
                process.env.TELEGRAM_PERSONAL_CHATID,
                `🗓 Ehi, il prossimo rinnovo è previsto per il ${info.dataRinnovo} alle ${info.orarioRinnovo}!`
            );

            info = await infoLinea();
            dataAvvisoRinnovo = moment(`${info.dataRinnovo} ${info.orarioRinnovo}`, "DD/MM/YYYY hh:mm").subtract(2, "days");
            jobAvvisoRinnovo.setTime(new CronTime(dataAvvisoRinnovo));
            jobAvvisoRinnovo.start();

            // Aggiorna la data di rinnovo il giorno successivo al rinnovo dell'offerta
            dataAggiornamentoRinnovo = dataAvvisoRinnovo.clone().add(Number(process.env.GIORNI_AL_RINNOVO) + 1, "days");

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const jobAggiornamentoDataRinnovo = new CronJob({
                cronTime: dataAggiornamentoRinnovo,
                onTick: async function (): Promise<void> {
                    info = await infoLinea();
                    dataAvvisoRinnovo = moment(`${info.dataRinnovo} ${info.orarioRinnovo}`, "DD/MM/YYYY hh:mm").subtract(2, "days");
                    jobAvvisoRinnovo.setTime(new CronTime(dataAvvisoRinnovo));
                    jobAvvisoRinnovo.start();
                },
                start: true,
                timeZone: "Europe/Rome"
            });
        },
        start: true,
        timeZone: "Europe/Rome"
    });
}
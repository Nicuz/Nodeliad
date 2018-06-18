const request = require('request');
const cheerio = require('cheerio');
const config = require('./config.json');

var areaRiservata = {
    url: "https://www.iliad.it/account/",
    method: "POST",
    followAllRedirects: true,
    jar: true,
    form: {
        "login-ident": config.iliad.username,
        "login-pwd": config.iliad.password
    }
};

var iliad = {};
var vociConsumiIta = ['chiamateEffettuateMinuti', 'chiamateCostiExtra', 'smsInviati', 'smsCostiExtra', 'datiUtilizzati', 'datiCostiExtra', 'mmsInviati', 'mmsCostiExtra'];
var vociConsumiEstero = ['chiamateEffettuateMinuti', 'chiamateCostiExtra', 'smsInviati', 'smsCostiExtra', 'datiUtilizzati', 'datiCostiExtra', 'datiUtilizzatiExtra', 'mmsInviati', 'mmsCostiExtra'];

exports.InfoLinea = function(html){
  const $ = cheerio.load(html);

  iliad = {
    "info": {
      "intestatario": $('.current-user .bold').first().text(),
      "id": $('.current-user .smaller').slice(1).first().text().replace('ID utente: ', ''),
      "numero": $('.current-user .smaller').slice(1).last().text().replace('Numero: ', ''),
      "credito": $('.p-conso h2 .red').text()
    }
  }
  return iliad.info;
};

exports.ConsumiItalia = function(html){
  const $ = cheerio.load(html);
  iliad.italia = {};

  $('.conso-local .conso__text .red').each(function(i, elem) {
    iliad['italia'][vociConsumiIta[i]] = $(this).text().replace(' SMS', '').replace(' MMS', '');
  });
  return iliad.italia;
};

exports.ConsumiEstero = function(html){
  const $ = cheerio.load(html);
  iliad.estero = {};

  $('.conso-roaming .conso__text .red').each(function(i, elem) {
    iliad['estero'][vociConsumiEstero[i]] = $(this).text().replace(' SMS', '').replace(' MMS', '');
  });
  return iliad.estero;
};

exports.Login = function(callback) {
  request.post(areaRiservata, function (err,res,body) {
    if (String(body).match(/ID utente o password non corretto./g) != null) {
      //Login fallito, restituisco errore
      callback('Errore durante il login. ID utente o password non corretto.');
    } else {
      //Login effettuato, restituisco il sorgente della pagina
      callback(body.replace(/<\/span> \//g, ' /').replace(/GB<br>/g, 'GB</span>'));
    }
  });
};

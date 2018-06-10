var request = require('request');
const cheerio = require('cheerio');
var config = require('./config.json');

var area_riservata = {
    url: 'https://www.iliad.it/account/',
    method: 'POST',
    followAllRedirects: true,
    jar: true,
    form: {
        'login-ident': config.iliad.username,
        'login-pwd': config.iliad.password
    }
}

var iliad = {};
var voci_consumi_ita = ['chiamate_effettuate_minuti', 'chiamate_costi_extra', 'sms_inviati', 'sms_costi_extra', 'dati_utilizzati', 'dati_costi_extra', 'mms_inviati', 'mms_costi_extra']
var voci_consumi_estero = ['chiamate_effettuate_minuti', 'chiamate_costi_extra', 'sms_inviati', 'sms_costi_extra', 'dati_utilizzati', 'dati_costi_extra', 'dati_utilizzati_extra', 'mms_inviati', 'mms_costi_extra']

exports.info_linea = function(html){
  const $ = cheerio.load(html);

  iliad = {
    'info': {
      'intestatario': $('.current-user .bold').first().text(),
      'id': $('.current-user .smaller').slice(1).first().text().replace('ID utente: ', ''),
      'numero': $('.current-user .smaller').slice(1).last().text().replace('Numero: ', ''),
      'credito': $('.p-conso h2 .red').text()
    }
  }
  return iliad.info;
}

exports.consumi_italia = function(html){
  const $ = cheerio.load(html);
  iliad.italia = {}

  $('.conso-local .conso__text .red').each(function(i, elem) {
    iliad['italia'][voci_consumi_ita[i]] = $(this).text().replace(' SMS', '').replace(' MMS', '');
  });
  return iliad.italia;
}

exports.consumi_estero = function(html){
  const $ = cheerio.load(html);
  iliad.estero = {}

  $('.conso-roaming .conso__text .red').each(function(i, elem) {
    iliad['estero'][voci_consumi_estero[i]] = $(this).text().replace(' SMS', '').replace(' MMS', '');
  });
  return iliad.estero;
}

exports.login = function(callback) {
  request.post(area_riservata, function (err,res,body) {
    if (String(body).match(/ID utente o password non corretto./g) != null) {
      //Login fallito, restituisco errore
      callback("Errore durante il login. ID utente o password non corretto.");
    } else {
      //Login effettuato, restituisco il sorgente della pagina
      callback(body.replace(/<\/span> \//g, ' /').replace(/GB<br>/g, 'GB</span>'));
    }
  });
}

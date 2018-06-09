var request = require('request');
var striptags = require('striptags');
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

//Testo da rimuovere per avere solo il consumo effettivo di chiamate, SMS ed MMS
var labels = ["Chiamate: ", " SMS", " MMS"]
var patterns = [/Chiamate: <span class="red">(.*)<\/span><br>/g, /<span class="red">(\d+) SMS<\/span>/g, /<span class="red">(\d+) MMS<br><\/span>/g, /<span class="red">(.*)<\/span> \/ (.*)<br>/g]

var info = [], italia = [], estero = []

exports.info_linea = function(html){
  //Nome e cognome
  info.push(html.match(/<div class="bold">(.*)<\/div>/i)[1]);
  //ID utente
  info.push(html.match(/ID utente: (\d+.\d+)/i)[1]);
  //Numero associato alla SIM Iliad
  info.push(html.match(/Numero: (\d+.\d+)/i)[1]);
  //Credito residuo
  info.push(html.match(/- Credito : <b class="red">(\d.+.(.|,)?)<\/b>/i)[1]);
  return info;
}

// 0 = chiamate, 1 = SMS, 2 = MMS, 3 = traffico dati
exports.consumi_italia = function(html){
  for (var i=0; i<=2; i++){
    italia.push(striptags(html.match(patterns[i])[0]).replace(labels[i],''));
  }
  italia.push(striptags(html.match(patterns[3])[0]));
  return italia;
}

exports.consumi_estero = function(html){
  for (var i=0; i<=2; i++){
    estero.push(striptags(html.match(patterns[i])[1]).replace(labels[i],''));
  }
  estero.push(striptags(html.match(patterns[3])[1]));
  return estero;
}

exports.login = function(callback) {
  request.post(area_riservata, function (err,res,body) {
    if (String(body).match(/ID utente o password non corretto./g) != null) {
      //Login fallito, restituisco errore
      callback("Errore durante il login. ID utente o password non corretto.");
    } else {
      //Login effettuato, restituisco il sorgente della pagina
      callback(body);
    }
  });
}

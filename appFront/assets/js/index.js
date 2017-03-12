// (function(){

function localStorageGet(item) {
    if (localStorage.getItem(item) != null) {
        return true
    }
    return false
}

let host = document.getElementById('host')
let port = document.getElementById('port')
let button = document.getElementById('okOrNot')

if (!localStorageGet("host") || !localStorageGet("port")) {
    host.disabled = false
    port.disabled = false
    let img = document.createElement('img')
    img.src = "../assets/img/validation.png"
    button.appendChild(img)
} else {
    host.value = "http://" + localStorage.getItem("host")
    port.value = localStorage.getItem("port")
    host.disabled = true
    port.disabled = true
    let img = document.createElement('img')
    img.src = "../assets/img/delete.png"
    button.appendChild(img)
    Connection()
}


function register() {
    if (!localStorageGet("host") || !localStorageGet("port")) {
        var h = host.value;
        var p = port.value;
        if (h != "" && p != "") {
            localStorage.setItem('host', h)
            localStorage.setItem('port', p)
            Connection()
        } else {
            notif("Informations Manquantes", "Désolé mais tu as oublié d'enregistrer les informations. Si tu veux valider alors rentres l'IP (adresse web) et le port.")
        }
        // location.reload()
    } else {
        localStorage.clear()
        location.reload()
    }
}

let tr, span_name, span_rx, span_rx_name, span_tx, span_tx_name, jsonObj, http_request;

function loadJSON(url) {
    http_request = new XMLHttpRequest();
    try {
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    } catch (e) {
        // Internet Explorer Browsers
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");

        } catch (e) {

            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
                // Something went wrong
                alert("Your browser broke!");
                return false;
            }

        }
    }

    http_request.onreadystatechange = function() {
        if (http_request.readyState === 4) {

            // Javascript function JSON.parse to parse JSON data
            jsonObj = JSON.parse(http_request.responseText);

            for (var i = 0; i < jsonObj.length; i++) {
                tr = checkElement('tr_' + i, 'tr', 'tbody')
                span_name = checkElement('name_' + i, "td", "tr_" + i)
                span_rx = checkElement('rx_' + i, "td", "tr_" + i)
                span_rx_name = checkElement('rx_name_' + i, "td", "tr_" + i)
                span_tx = checkElement('tx_' + i, "td", "tr_" + i)
                span_tx_name = checkElement('tx_name_' + i, "td", "tr_" + i)

                span_name.innerHTML = jsonObj[i].Name
                span_rx.innerHTML = jsonObj[i].RxFinal
                span_rx_name.innerHTML = jsonObj[i].RxName
                span_tx.innerHTML = jsonObj[i].TxFinal
                span_tx_name.innerHTML = jsonObj[i].TxName
            }
        }
    }

    http_request.open("GET", url, true);
    http_request.send();
}

let tmp, d;

function checkElement(id, elt, parent) {
    tmp = document.getElementById(id)
    if (tmp == null) {
        d = document.createElement(elt)
        d.id = id
        document.getElementById(parent).appendChild(d)
        return d
    }
    return tmp
}

function notif(title, body) {
    new Notification(title, {
        body: body,
        icon: '../assets/img/sokys.png'
    });
}


let reconnection = false
var url, xhr;

function Connection() {
    url = "http://" + localStorage.getItem("host") + ":" + localStorage.getItem("port")

    xhr = new XMLHttpRequest();

    xhr.open('HEAD', url, true);
    xhr.send();

    xhr.addEventListener("readystatechange", processRequest, false);

    // debugger


    function processRequest(e) {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 304) {
                if (!reconnection) {
                    notif("Connection Ok !", "Super la connexion est réussi!!")
                }
                reconnection = true
                window.setTimeout(Connection, 1000)
                loadJSON(url)
            } else {
                notif("Problème de connexion. L'adresse : " + url + " ne fournit pas de connection\nTest de connexion dans 30s");
                reconnection = false
                window.setTimeout(Connection, 30000)
            }
        }
    }
}
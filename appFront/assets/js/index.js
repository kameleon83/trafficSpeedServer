// (function(){

function localStorageGet(item){
    if (localStorage.getItem(item) != null){
        return true
    }
    return false
}

let host = document.getElementById('host')
let port = document.getElementById('port')
let button = document.getElementById('okOrNot')

if (!localStorageGet("host") || !localStorageGet("port")){
    host.disabled = false
    port.disabled = false
    let img = document.createElement('img')
    img.src = "../assets/img/validation.png"
    button.appendChild(img)
}else{
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
    if (!localStorageGet("host") || !localStorageGet("port")){
        var h = host.value;
        var p = port.value;
        localStorage.setItem('host', h)
        localStorage.setItem('port', p)
        Connection()
        // location.reload()
    }else{
        localStorage.clear()
        location.reload()
    }
}


function loadJSON(url){
    var http_request = new XMLHttpRequest();
    try{
        // Opera 8.0+, Firefox, Chrome, Safari
        http_request = new XMLHttpRequest();
    }catch (e){
        // Internet Explorer Browsers
        try{
            http_request = new ActiveXObject("Msxml2.XMLHTTP");

        }catch (e) {

            try{
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e){
                // Something went wrong
                alert("Your browser broke!");
                return false;
            }

        }
    }

    http_request.onreadystatechange = function(){
        if (http_request.readyState === 4 ){

            // Javascript function JSON.parse to parse JSON data
            var jsonObj = JSON.parse(http_request.responseText);

            for (var i = 0; i < jsonObj.length; i++) {
                let tr = checkElement('tr_'+i, 'tr','tbody')
                let span_name = checkElement('name_'+i,"td","tr_" + i)
                let span_rx = checkElement('rx_'+i,"td","tr_" + i)
                let span_rx_name = checkElement('rx_name_'+i,"td","tr_" + i)
                let span_tx = checkElement('tx_'+i,"td","tr_" + i)
                let span_tx_name = checkElement('tx_name_'+i,"td","tr_" + i)

            }
            for (var i = 0; i < jsonObj.length; i++) {
                let span_name = document.getElementById('name_' + i)
                let span_rx = document.getElementById('rx_' + i)
                let span_rx_name = document.getElementById('rx_name_' + i)
                let span_tx = document.getElementById('tx_' + i)
                let span_tx_name = document.getElementById('tx_name_' + i)

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

function checkElement(id, elt, parent){
    let tmp = document.getElementById(id)
    if (tmp == null) {
        var d = document.createElement(elt)
        d.id = id
        document.getElementById(parent).appendChild(d)
        return d
    }
    return tmp
}

function notif(title, body){
    new Notification(title,{
        body: body,
        icon: 'assets/img/sokys.png'
    });
}


function Connection(){
    let url = "http://" + localStorage.getItem("host") + ":" + localStorage.getItem("port")

    var xhr = new XMLHttpRequest();

    xhr.open('HEAD', url, true);
    xhr.send();

    xhr.addEventListener("readystatechange", processRequest, false);
    function processRequest(e) {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 304) {
                notif("Connection Ok !", "Super la connexion est réussi!!")
                window.setInterval(function(){
                    loadJSON(url)
                },1000)
            } else {
                localStorage.clear()
                host.value = ""
                port.value = ""
                alert("Problème de connexion. L'adresse : " + url + " ne fournit pas de connection");
            }
        }
    }
}

let msgTimeout;

function showMessage(msg) {
    const div = document.getElementById('message'); 
    div.innerText = msg;
    clearTimeout(msgTimeout); 
    msgTimeout = setTimeout(function() { div.innerText = ''; }, 3000);
}

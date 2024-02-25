var button = document.getElementById('save');
var value = document.getElementById('prefix');

var alert = document.createElement('p');
alert.classList = 'alert success';
alert.textContent = 'Cambios guardados.';

var alertCon = document.querySelector('.alert-container');

save.addEventListener('click', () => {

  fetch(window.location.href, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "setting": "prefix",
      "data": value.value
    })

  }).then(res => {
    res.json().then(data => {
      alert.innerHTML = data.message.join('<br>');
      alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
      alertCon.appendChild(alert);
    });
  });

  setTimeout(() => alert.remove(), 6000);

})
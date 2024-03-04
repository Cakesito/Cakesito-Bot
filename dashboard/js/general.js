var savePrefix = document.getElementById('save-prefix');
var prefix = document.getElementById('prefix');
var saveCurrency = document.getElementById('save-currency');
var currencyEmoji = document.getElementById('currency-emoji');
var currencyName = document.getElementById('currency-name');

var currencySymbol = document.querySelector('.symbol');
var info = document.querySelectorAll('.marked')[1];
var add = document.getElementById('add');
var alertCon = document.querySelector('.alert-container');

info.textContent = '<a:nombre:id>';

var alert = document.createElement('p');
alert.classList = 'alert success';
alert.textContent = 'Cambios guardados.';

var alertCon = document.querySelector('.alert-container');

add.innerHTML = currencyName.value.replace(' ', '&nbsp;');
updateEmoji(currencySymbol, currencyEmoji.value);

currencyEmoji.addEventListener('focusout', () => updateEmoji(currencySymbol, currencyEmoji.value));
currencyName.addEventListener('input', () => add.innerHTML = currencyName.value.replaceAll(' ', '&nbsp;'));

saveCurrency.addEventListener('click', () => {
  fetch(window.location.href, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "setting": "convertion",
      "data": { emoji: currencyEmoji.value || '', name: currencyName.value || '' }
    })

  }).then(res => {
    res.json().then(data => {
      alert.innerHTML = data.message.join('<br>');
      alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
      alertCon.appendChild(alert);

      if (res.ok) location.reload();
    });
  });

  setTimeout(() => alert.remove(), 6000);

})

savePrefix.addEventListener('click', () => {

  fetch(window.location.href, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "setting": "prefix",
      "data": prefix.value
    })

  }).then(res => {
    res.json().then(data => {
      alert.innerHTML = data.message.join('<br>');
      alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
      alertCon.appendChild(alert);

      if (res.ok) location.reload();
    });
  });

  setTimeout(() => alert.remove(), 6000);

});

function updateEmoji (img, string) {
  var animated = string.split(':')[0].includes('a');
  var id = string.split(':')[2]?.split('>')[0];

  if (!id) return img.src = '';
  img.src = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}`;
}
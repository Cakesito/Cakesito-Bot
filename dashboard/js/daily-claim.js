import ms from './ms.js';

var input = document.querySelectorAll('input');
var claimInput = document.querySelector('.claim-input');

var dailySaveBtn = document.getElementById('save-daily');
var claimSaveBtn = document.getElementById('save-claim');

var dailyObjectMin = document.getElementById('object-min-daily');
var dailyObjectMax = document.getElementById('object-max-daily');
var dailyMaterialMin = document.getElementById('material-min-daily');
var dailyMaterialMax = document.getElementById('material-max-daily');

var claimObjectMin = document.getElementById('object-min-claim');
var claimObjectMax = document.getElementById('object-max-claim');
var claimMaterialMin = document.getElementById('material-min-claim');
var claimMaterialMax = document.getElementById('material-max-claim');

var amounts = [[claimObjectMin, claimObjectMax], [claimMaterialMin, claimMaterialMax], [dailyObjectMin, dailyObjectMax], [dailyMaterialMin, dailyMaterialMax]];

amounts.forEach(list => {
    var min = list[0];
    var max = list[1];

    if (max && min) {

        max.addEventListener('change', () => {
            if (Number(max.value) < Number(min.value)) max.value = min.value;
            if (max.value < 0) max.value = '0';
            if (!Number.isInteger(Number(max.value))) max.value = Math.floor(max.value);
            resizeInput.call(max);
        });
    
        min.addEventListener('change', () => {
            if (Number(min.value) > Number(max.value)) min.value = max.value;
            if (min.value < 0) min.value = '0';
            if (!Number.isInteger(Number(min.value))) min.value = Math.floor(min.value);
            resizeInput.call(min);
        });
    }
});

var alertCon = document.querySelector('.alert-container');

claimInput.value = ms(claimInput.value, { toString: true });
claimInput.addEventListener('focusout', () => { 

    var valid = isValidCooldown(claimInput);
    if (valid) {
        if (isNaN(claimInput.value)) return claimInput.classList = 'claim-input';
        claimInput.value = ms(claimInput.value * 1000, { toString: true });

        claimInput.classList = 'claim-input';
        resizeInput.call(claimInput);

    } else claimInput.classList = 'claim-input invalid';
});

dailySaveBtn.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';
    
    let daily = { setting: 'daily' , data: { reward: {} } };

    var selected = document.getElementById('daily-selected');
    if (!selected) return;

    var texts = document.querySelector('#custom-text-1 > div > div > textarea');
    daily.data.txt = texts.value;

    if (selected.classList == 'div-money div-money-daily') {
        var inputMoney = document.getElementById('input-money-daily');
        if (inputMoney.value == '') inputMoney.value = '0';

        daily.data.reward.type = 'cash';
        daily.data.reward.amount = inputMoney.value;

    } else {

        daily.data.reward.type = 'inv.';
        var objectSelected = document.getElementById('select-objects-daily');
        var materialSelected = document.getElementById('select-materials-daily');

        if (objectSelected || materialSelected) daily.data.reward.materials = {};

        if (objectSelected && objectSelected.value != 'Nada') daily.data.reward.materials[objectSelected.value] = [dailyObjectMin, dailyObjectMax];
        if (materialSelected && materialSelected.value != 'Nada') daily.data.reward.materials[materialSelected.value] = [dailyMaterialMin, dailyMaterialMax];
    }
    
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(daily)
    }).then(() => {});

    alertCon.appendChild(alert);
    setTimeout(() => alert.remove(), 6000);

});

claimSaveBtn.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    let daily = { 'setting': 'claim' , data: { 'reward': {} } };

    var selected = document.getElementById('claim-selected');
    var cooldown = document.getElementById('claim-cooldown');

    if(!isValidCooldown(cooldown)) return;
    if (!selected) return;

    var texts = document.querySelector('#custom-text-2 > div > div > textarea');
    daily.data.txt = texts.value;

    daily.data.cooldown = ms(cooldown, { toString: false });

    if (selected.classList == 'div-money div-money-claim') {
        var inputMoney = document.getElementById('input-money-claim');
        if (inputMoney.value == '') inputMoney.value = '0';

        daily.data.reward.type = 'cash';
        daily.data.reward.amount = inputMoney.value;

    } else {
        
        daily.data.reward.type = 'inv.';
        var objectSelected = document.getElementById('select-objects-claim');
        var materialSelected = document.getElementById('select-materials-claim');

        if (objectSelected || materialSelected) daily.data.reward.materials = {};

        if (objectSelected && objectSelected.value != 'Nada') daily.data.reward.materials[objectSelected.value] = [claimObjectMin, claimObjectMax];
        if (materialSelected && materialSelected.value != 'Nada') daily.data.reward.materials[materialSelected.value] = [claimMaterialMin, claimMaterialMax];
    }
    
    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(daily)
    }).then(() => {});

    alertCon.appendChild(alert);
    setTimeout(() => alert.remove(), 6000);

});

input.forEach(x => {
    x.addEventListener('input', resizeInput);
    resizeInput.call(x);
});

function resizeInput() {
    if (this.value.length >= 4) return;
    this.style.width = (this.value.length + 0.5) + "ch";
}

function isValidCooldown (element) {
    if (element.value.startsWith('-')) return false;
    if (isNaN(element.value)) {
        if (isNaN(ms(element.value, { toString: false }))) return false;
        return true;
    }

    return true;
}
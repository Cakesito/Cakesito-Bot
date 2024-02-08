// hi to anyone watching, this code is shit

import ms from './ms.js';

var input = document.querySelectorAll('input');

var workMin = document.getElementById('input-work-min');
var workMax = document.getElementById('input-work-max');

var objectMin = document.getElementById('object-min');
var objectMax = document.getElementById('object-max'); 
var materialMin = document.getElementById('material-min');
var materialMax = document.getElementById('material-max');

var crimeSuccessMin = document.getElementById('input-crime-success-min');
var crimeSuccessMax = document.getElementById('input-crime-success-max');

var crimeFailMin = document.getElementById('input-crime-fail-min');
var crimeFailMax = document.getElementById('input-crime-fail-max');

var crimeProb = document.getElementById('input-crime-probability');

var amounts = [[workMin, workMax], [objectMin, objectMax], [materialMin, materialMax], [crimeSuccessMin, crimeSuccessMax], [crimeFailMin, crimeFailMax]];

var workCooldown = document.getElementById('input-work-cooldown');
var exploreCooldown = document.getElementById('input-explore-cooldown');
var crimeCooldown = document.getElementById('input-crime-cooldown');

var cooldowns = [workCooldown, exploreCooldown, crimeCooldown];

var addCustomTextBtn = document.querySelectorAll('.add-text');
var deleteCustomTextBtn = document.querySelectorAll('.remove-text');

var saveWork = document.getElementById('save-work');
var saveExplore = document.getElementById('save-explore');
var saveCrime = document.getElementById('save-crime');

var alertCon = document.querySelector('.alert-container');

saveCrime.addEventListener('click', () => {
    if(!isValidCooldown(crimeCooldown)) return;

    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados';

    var crime = { setting: 'crime', data: { success: {}, fail: {} } };
    crime.data.cooldown = ms(crimeCooldown.value, { toString: false });

    crime.data.probability = crimeProb.value;

    crime.data.success.min = crimeSuccessMin.value;
    crime.data.success.max = crimeSuccessMax.value;

    crime.data.fail.min = crimeFailMin.value;
    crime.data.fail.max = crimeFailMax.value;

    var successTexts = Array.from(document.querySelectorAll('#custom-text-4 > div > div > textarea')).map(x => x.value);
    var failTexts = Array.from(document.querySelectorAll('#custom-text-5 > div > div > textarea')).map(x => x.value);

    crime.data.success.txt = successTexts;
    crime.data.fail.txt = failTexts;

    alertCon.appendChild(alert);

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(crime)
    }).then((x) => console.log(x));

    setTimeout(() => alert.remove(), 6000);

});

saveExplore.addEventListener('click', () => {
    if (!isValidCooldown(exploreCooldown)) return;

    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var explore = { setting: 'explore', data: { materials: {}, txt: {} } };
    explore.data.cooldown = ms(exploreCooldown.value, { toString: false });

    var selectedObject = document.getElementById('select-objects');
    if (selectedObject && selectedObject.value != 'Nada') explore.data.materials[selectedObject.value] = [objectMin, objectMax];

    var selectedMaterial = document.getElementById('select-materials');
    if (selectedMaterial && selectedMaterial.value != 'Nada') explore.data.materials[selectedMaterial.value] = [materialMin, materialMax];

    var successTexts = Array.from(document.querySelectorAll('#custom-text-2 > div > div > textarea')).map(x => x.value);
    var failTexts = Array.from(document.querySelectorAll('#custom-text-3 > div > div > textarea')).map(x => x.value);

    explore.data.txt.success = successTexts;
    explore.data.txt.fail = failTexts;

    alertCon.appendChild(alert);

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(explore)
    }).then((x) => console.log(x));

    setTimeout(() => alert.remove(), 6000);
    
});

saveWork.addEventListener('click', () => {
    if (!isValidCooldown(workCooldown)) return;

    var alert = document.createElement('p');
    alert.textContent = 'Cambios guardados.';
    alert.classList = 'alert success';

    var work = { setting: 'work', data: {} };
    work.data.cooldown = ms(workCooldown.value, { toString: false });

    work.data.min = workMin.value;
    work.data.max = workMax.value;

    var texts = Array.from(document.querySelectorAll('#custom-text-1 > div > div > textarea')).map(x => x.value);
    work.data.txt = texts;

    alertCon.appendChild(alert);

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(work)
    }).then(() => {});

    setTimeout(() => alert.remove(), 6000);
});

deleteCustomTextBtn.forEach(btn => {
    var button = document.querySelector(`#${btn.parentElement.parentElement.parentElement.id} > button`);
    btn.addEventListener('click', () => {
        btn.parentElement.remove();
        button.disabled = false;
    });
});

addCustomTextBtn.forEach(btn => {

    btn.addEventListener('click', () => {
        var subDiv = document.querySelector(`#${btn.parentElement.id} > .custom-text`);
        var newDiv = document.createElement('div');
        newDiv.classList = 'yet-another-div';
        var textCount = subDiv.childElementCount;
        
        var newTextArea = document.createElement('textarea');
        newTextArea.textContent = '{}';
        newTextArea.rows = '5';
        newTextArea.maxLength = '2000';
        
        var newDeleteCustomTextBtn = document.createElement('button');
        newDeleteCustomTextBtn.classList = 'caution remove-text';
        newDeleteCustomTextBtn.textContent = 'Eliminar';
        
        subDiv.appendChild(newDiv);
        newDiv.appendChild(newTextArea);
        newDiv.appendChild(newDeleteCustomTextBtn);

        newDeleteCustomTextBtn.addEventListener('click', () => {
            newDeleteCustomTextBtn.parentElement.remove();
            btn.disabled = false;
        });

        if (textCount >= 2) return btn.disabled = true;
    });
});


cooldowns.forEach(cd => {

    cd.value = ms(cd.value, { toString: true });

    cd.addEventListener('focusout', () => {
        var valid = isValidCooldown(cd);
        if (valid) {
            if (isNaN(cd.value)) return cd.classList = '';
            cd.value = ms(cd.value * 1000, { toString: true });

            cd.classList = '';
            resizeInput.call(cd);
        } else cd.classList = 'invalid';
    });
});

crimeProb.addEventListener('focusout', () => {
    if (crimeProb.value > 100) crimeProb.value = '100';
    if (crimeProb.value < 0) crimeProb.value = '0';
    resizeInput.call(crimeProb);
});

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

input.forEach(x => {
    x.addEventListener('input', resizeInput);
    resizeInput.call(x);
});

function resizeInput() {
    if (this.value.length > 4) return;
    this.style.width = (this.value.length + 0.5) + "ch";
    if (this.value.length == 0) this.style.width = "4rem";
}

function isValidCooldown (element) {
    if (element.value.startsWith('-')) return false;
    if (isNaN(element.value)) {
        if (isNaN(ms(element.value, { toString: false }))) return false;
        return true;
    }
    return true;
}
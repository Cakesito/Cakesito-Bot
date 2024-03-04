var input = document.querySelectorAll('input');

var objects = document.querySelectorAll('.object');
var addObject = document.getElementById('add-object');

var closeObjectInfo = document.querySelector('.object-info-close');
var objectInfo = document.querySelector('.object-info');
var objectName = document.getElementById('object-info-name');
var objectDescription = document.getElementById('object-info-description');
var objectProbability = document.getElementById('object-info-probability');

var textInputs = document.querySelectorAll('input[type="text"]');
let lastObject; // get values to parse in fetch
let actualObject; // reset values when "x" is clicked

var materials = document.querySelectorAll('.material-list');
var activeMaterials = document.querySelector('.active-materials');

var layer = document.querySelector('.layer');

var saveButton = document.getElementById('save');
var deleteButton = document.getElementById('delete-object');
var alertCon = document.querySelector('.alert-container');

var objectCountText = document.querySelector('.available-text');
var objectCount = document.querySelectorAll('.object').length;
if (objectCount >= 10) addObject.classList = 'unavailable';

let materialList = [];

var check = document.querySelector('.no-materials');

saveButton.disabled = true;
textInputs.forEach(x => {
    x.addEventListener('change', () => {
        if (objectName.value == '') return saveButton.disabled = true;
        
        if (x.value == '') {
            x.classList = x.classList + 'invalid';
            saveButton.disabled = true;
        } else {
            x.classList = x.classList.remove('invalid');
            saveButton.disabled = false;
        }
        
    });
});

objectProbability.addEventListener('focusout', () => {
    if (objectProbability.value > 100) objectProbability.value = '100'
        if (objectProbability.value < 0) objectProbability.value = '0';
        if (!Number.isInteger(objectProbability.value)) objectProbability.value = Math.floor(objectProbability.value);
        resizeInput.call(objectProbability);
});

saveButton.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var object = { setting: 'craft.items' };

    var objList = document.querySelectorAll('.jijiji');
    let obj = [];
    objList.forEach(x => obj.push(JSON.parse(x.value)));

    var selected = obj.find(x => x.id == lastObject);

    selected.name = objectName.value;
    selected.description = objectDescription.value.length ? objectDescription.value : undefined;
    selected.probability = Number(objectProbability.value);
    selected.materials = materialList;
    selected.id = lastObject;

    console.log(selected);

    object.data = obj;

    if (check) return;

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then(res => {
        res.json().then(data => {
            alert.innerHTML = data.message.join('<br>');
            alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
            alertCon.appendChild(alert);
            if (res.ok) location.reload();
        });
    });

    alertCon.appendChild(alert);
    setTimeout(() => alert.remove(), 6000);

});

deleteButton.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var object = { setting: 'craft.items' };

    var objList = document.querySelectorAll('.jijiji');
    let obj = [];
    objList.forEach(x => obj.push(JSON.parse(x.value)));

    var selected = obj.find(x => x.id == lastObject);
    obj.splice(obj.indexOf(selected), 1);

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then((res) => {
        res.json().then(data => {
            alert.innerHTML = data.message.join('<br>');
            alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
            alertCon.appendChild(alert);
            if (res.ok) location.reload();
        });
    });

    setTimeout(() => alert.remove(), 6000);
    
});

addObject.addEventListener('click', () => {
    if (addObject.classList.contains('unavailable')) return;
    objectCount++;

    objectCountText.textContent = `Objetos disponibles (${objectCount}/10)`;

    var containerDiv = document.querySelector('.objects-container');
    var newObjectDiv = document.getElementById('object-template').cloneNode(true);
    newObjectDiv.classList = 'object';

    var id = generateId();
    var newP = document.createElement('input');
    newP.classList = 'invisible jijiji';
    newP.id = `info-${id}`;
    newP.value = `{ "name": "Sin nombre", "id": ${id} }`;
    newP.hidden = true;

    newObjectDiv.appendChild(newP);
    lastObject = id;
    
    newObjectDiv.addEventListener('click', () => {
        objectInfo.style.width = mobile.matches ? '100%' : '40%';
        layer.style.opacity = '1';
        layer.style.visibility = 'visible';
    });

    containerDiv.appendChild(newObjectDiv);

    if (objectCount >= 10) addObject.classList = 'unavailable';
});

materials.forEach(x => {
    x.addEventListener('click', () => {
        var id = Number(x.id.replace('material-', ''));
        var svg = document.querySelector(`#${x.id} > svg`);
        
        var materialInList = materialList.find(k => k.ref_id === id);

        if (!materialInList) {
            materialList.push({ ref_id: id, amount: 1 });
            materialInList = materialList.find(k => k.ref_id === id);
        }
        
        if (x.parentElement.classList.contains('material-list-list')) {
            svg.style.transform = 'rotate(180deg)';
            
            var amount = document.createElement('input');
            amount.type = 'number';
            amount.value = '1';
            amount.style.width = '1.5ch';
            amount.id = `object-${id}-amount`;
            
            materialInList.amount = Number(amount.value);
            
            amount.addEventListener('input', () => {
                checkNumber.call(amount);
                resizeInput.call(amount);
                materialInList.amount = Number(amount.value);
                
                saveButton.disabled = false;
            });
            
            var div = document.createElement('div');
            div.id = `div-${x.id}`;
            
            div.appendChild(x);
            div.appendChild(amount);
            activeMaterials.append(div);
            saveButton.disabled = false;
            
        } else {
            svg.style.transform = 'rotate(0deg)';
            var list = document.querySelector('.material-list-list');
            
            div = document.getElementById(`div-${x.id}`);
            materialList.splice(materialList.indexOf(materialInList), 1);

            div.remove();
            list.appendChild(x);
        }

    });
});

closeObjectInfo.addEventListener('click', () => {
    objectInfo.style.right = '-5rem';
    objectInfo.style.width = '0';
    layer.style.opacity = '0';
    layer.style.visibility = 'hidden';

    var info = document.getElementById(`info-${actualObject.id}`);
    var info = JSON.parse(info.value);

    objectName.value = '';
    objectDescription.value = '';
    objectProbability.value = '0';

    info.materials.forEach(material => {
        var btn = document.querySelector(`#material-${material.ref_id}`);
        btn.click();
    });
});

objects.forEach(x => {
    x.addEventListener('click', () => {
        actualObject = x;

        objectInfo.style.width = mobile.matches ? '100%' : '40%';
        layer.style.opacity = '1';
        layer.style.visibility = 'visible';

        var info = document.getElementById(`info-${x.id}`);
        var info = JSON.parse(info.value);

        objectName.value = info.name;
        objectDescription.value = info.description;
        objectProbability.value = info.probability;
        lastObject = info.id;

        info.materials.forEach(material => {
            var btn = document.querySelector(`#material-${material.ref_id}`);
            btn.click();
            
            var amount = document.querySelector(`#object-${material.ref_id}-amount`);
            amount.value = material.amount;

            var materialInList = materialList.find(k => k.ref_id === material.ref_id);
            materialInList.amount = material.amount;
        });


        objectDescription.addEventListener('input', resizeInput)
        resizeInput.call(objectProbability);

    });
});

const mobile = window.matchMedia('(max-width: 600px)');

function resizeInput() {
    this.style.width = (this.value.length + 0.5) + "ch";
}

function checkNumber() {
    if (this.value < 0) this.value = 0;
    if (!Number.isInteger(Number(this.value))) this.value = Math.floor(this.value);
    if (this.value == '') this.value = '0';
    resizeInput.call(this);
}

function generateId () {
    var objects = document.querySelectorAll('.object');
    let ids = [];

    for (obj of objects) ids.push(Number(obj.id));

    var num = Math.floor(Math.random() * 10) + 10;
    return (ids.includes(num)) ? generateId() : num;
}
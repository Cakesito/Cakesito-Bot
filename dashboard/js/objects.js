var input = document.querySelectorAll('input');

var objects = document.querySelectorAll('.object');
var addObject = document.getElementById('add-object');

var closeObjectInfo = document.querySelector('.object-info-close');
var objectInfo = document.querySelector('.object-info');
var objectName = document.getElementById('object-info-name');
var objectDescription = document.getElementById('object-info-description');
var objectProbability = document.getElementById('object-info-probability');

var textInputs = document.querySelectorAll('input[type="text"]');
let lastObject;

var materials = document.querySelectorAll('.material-list');
var activeMaterials = document.querySelector('.active-materials');

var layer = document.querySelector('.layer');

var saveButton = document.getElementById('save');
var deleteButton = document.getElementById('delete-object');
var alertCon = document.querySelector('.alert-container');

var objectCountText = document.querySelector('.available-text');
var objectCount = document.querySelectorAll('.object').length;
if (objectCount >= 10) addObject.classList = 'unavailable';

let materialList = {};
let actualObject;

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

saveButton.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var object = { setting: 'craft.items' };

    var objList = document.querySelectorAll('.jijiji');
    let obj = [];
    objList.forEach(x => obj.push(JSON.parse(x.textContent)));

    var selected = obj.find(x => x.name == lastObject);

    selected.name = objectName.value;
    selected.description = objectDescription.value;
    selected.probability = objectProbability.value;
    selected.materials = materialList;

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
        if (res.status == 400) {
            res.json().then(data => {
                alert.innerHTML = data.errors.join('<br>');
                alert.classList = 'alert error';
                alertCon.appendChild(alert);
            });
        } else {
            alertCon.appendChild(alert);
            location.reload();
        }
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
    objList.forEach(x => obj.push(JSON.parse(x.textContent)));

    var selected = obj.find(x => x.name == lastObject);
    obj.splice(obj.indexOf(selected), 1);

    console.log(obj);

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    }).then(() => {});

    location.reload();

    alertCon.appendChild(alert);
    setTimeout(() => alert.remove(), 6000);
    
});

addObject.addEventListener('click', () => {
    if (addObject.classList.contains('unavailable')) return;
    objectCount++;

    objectCountText.textContent = `Objetos disponibles (${objectCount}/10)`;

    var containerDiv = document.querySelector('.objects-container');
    var newObjectDiv = document.getElementById('object-template').cloneNode(true);
    newObjectDiv.classList = 'object';

    var newP = document.createElement('p');
    newP.classList = 'invisible jijiji';
    newP.id = `info-Sin nombre`;
    newP.textContent = `{ "name": "Sin nombre" }`;

    newObjectDiv.appendChild(newP);
    lastObject = 'Sin nombre';
    
    newObjectDiv.addEventListener('click', () => {
        objectInfo.style.width = '40%';
        layer.style.opacity = '1';
        layer.style.visibility = 'visible';
    });

    containerDiv.appendChild(newObjectDiv);

    if (objectCount >= 10) addObject.classList = 'unavailable';
});

materials.forEach(x => {
    x.addEventListener('click', () => {

        var name = x.textContent.replace(' ', '');
        var svg = document.querySelector(`#${x.id} > svg`);

        if (x.parentElement.classList.contains('material-list-list')) {
            svg.style.transform = 'rotate(180deg)';

            var amount = document.createElement('input');
            amount.type = 'number';
            amount.value = '1';
            amount.style.width = '1.5ch';
            amount.id = `object-${name}-amount`;

            materialList[name] = amount.value;

            amount.addEventListener('input', resizeInput);
            amount.addEventListener('input', () => {
                checkNumber.call(amount);
                materialList[name] = amount.value;
                saveButton.disabled = false;
            });

            var div = document.createElement('div');
            div.id = `div-${name}`;

            div.appendChild(x);
            div.appendChild(amount);
            activeMaterials.append(div);
            saveButton.disabled = false;

        } else {
            svg.style.transform = 'rotate(0deg)';
            var list = document.querySelector('.material-list-list');

            div = document.getElementById(`div-${name}`);
            delete materialList[name];

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
    var info = JSON.parse(info.textContent);

    objectName.value = '';
    objectDescription.value = '';
    objectProbability.value = '0';

    Object.entries(info.materials).forEach(material => {
        var btn = document.querySelector(`#material-${material[0]}`);
        btn.click();
    });
});

objects.forEach(x => {
    x.addEventListener('click', () => {
        actualObject = x;

        objectInfo.style.width = '40%';
        layer.style.opacity = '1';
        layer.style.visibility = 'visible';

        var info = document.getElementById(`info-${x.id}`);
        var info = JSON.parse(info.textContent);

        objectName.value = info.name;
        objectDescription.value = info.description;
        objectProbability.value = info.probability;
        lastObject = info.name;

        Object.entries(info.materials).forEach(material => {
            var btn = document.querySelector(`#material-${material[0]}`);
            btn.click();

            var amount = document.querySelector(`#object-${material[0]}-amount`);
            amount.value = material[1];

            materialList[material[0]] = material[1];
        });

        objectDescription.addEventListener('input', resizeInput)
        resizeInput.call(objectProbability);

    });
});

function resizeInput() {
    this.style.width = (this.value.length + 0.5) + "ch";
}

function checkNumber() {
    if (this.value < 0) this.value = 0;
    if (!Number.isInteger(Number(this.value))) this.value = Math.floor(this.value);
    if (this.value == '') this.value = '0';
    resizeInput.call(this);
}
var input = document.querySelectorAll('input');

var objects = document.querySelectorAll('.object');
var addObject = document.getElementById('add-object');

var closeObjectInfo = document.querySelector('.object-info-close');
var objectInfo = document.querySelector('.object-info');

var objectName = document.getElementById('object-info-name');
var objectDescription = document.getElementById('object-info-description');
var objectOnlyOnce = document.getElementById('object-info-onlyonce');
var objectPriceType = document.getElementById('object-info-price-type');
var objectPrice = document.getElementById('object-info-price');
var objectRewardType = document.getElementById('object-info-reward-type');
var objectReward = document.getElementById('object-info-reward');

var textInputs = document.querySelectorAll('input[type="text"]');
let lastObject;

var layer = document.querySelector('.layer');

var saveButton = document.getElementById('save');
var deleteButton = document.getElementById('delete-object');
var alertCon = document.querySelector('.alert-container');

var objectCountText = document.querySelector('.available-text');
var objectCount = document.querySelectorAll('.object').length;
if (objectCount >= 10) addObject.classList = 'unavailable';

let actualObject;

if (objectRewardType.value == 'role') objectReward.placeholder = 'Id del rol';

objectRewardType.addEventListener('change', () => {
    objectRewardType.value == 'role' ? objectReward.placeholder = 'Id del rol' : objectReward.placeholder = '';
    saveButton.disabled = false;
});

objectPriceType.addEventListener('change', () => saveButton.disabled = false );

saveButton.disabled = true;
textInputs.forEach(x => {
    x.addEventListener('change', () => {
        if (objectName.value == '') return saveButton.disabled = true;
        
        if (x.value == '') {
            x.classList = x.classList + ' invalid'
            saveButton.disabled = true;
        } else {
            x.classList = x.classList.remove('invalid');
            saveButton.disabled = false;
        }
    });
});

objectOnlyOnce.addEventListener('change', () => saveButton.disabled = false);

[objectReward, objectPrice].forEach(x => {
    x.addEventListener('change', () => {
        if (objectName.value == '') return saveButton.disabled = true;

        if (x.value < 0) x.value = '0';
        if (!Number.isInteger(Number(x.value))) x.value = Math.floor(x.value);

        if (x.value == '') {
            x.classList = x.classList + ' invalid';
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

    var object = { setting: 'shop.items' };

    var objList = document.querySelectorAll('.jijiji');
    let obj = [];
    objList.forEach(x => obj.push(JSON.parse(x.textContent)));

    var selected = obj.find(x => x.name == lastObject);

    selected.name = objectName.value;
    selected.description = objectDescription.value;
    selected.onlyOnce = objectOnlyOnce.value == 'on' ? true : false;
    console.log(objectOnlyOnce.value)
    selected.price.type = objectPriceType.value;
    selected.price.amount = objectPrice.value;
    selected.reward.type = objectRewardType.value;

    objectRewardType.value == 'role' ? selected.reward.id = objectReward.value : selected.reward.amount = objectReward.value;

    object.data = obj;

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

deleteButton.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var object = { setting: 'shop.items' };

    var objList = document.querySelectorAll('.jijiji');
    let obj = [];
    objList.forEach(x => obj.push(JSON.parse(x.textContent)));

    var selected = obj.find(x => x.name == lastObject);
    obj.splice(obj.indexOf(selected), 1);

    object.data = obj;

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

closeObjectInfo.addEventListener('click', () => {
    objectInfo.style.right = '-5rem';
    objectInfo.style.width = '0';
    layer.style.opacity = '0';
    layer.style.visibility = 'hidden';

    var info = document.getElementById(`info-${actualObject.id}`);
    var info = JSON.parse(info.textContent);

    objectName.value = '';
    objectDescription.value = '';
    objectOnlyOnce.checked = false;
    objectPriceType.value = '';
    objectPrice.value = '';
    objectRewardType.value = '';
    objectReward.value = '';

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
        objectOnlyOnce.checked = info.onlyOnce;
        objectPriceType.value = info.price.type.replace('inv.', '');
        objectPrice.value = info.price.amount;
        objectRewardType.value = info.reward.type;
        objectReward.value = info.reward.amount ?? info.reward.id;

        lastObject = info.name;

        objectDescription.addEventListener('input', resizeInput)

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
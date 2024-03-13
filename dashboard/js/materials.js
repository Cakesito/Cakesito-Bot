var input = document.querySelectorAll('input');

var removeObject = document.querySelectorAll('.remove-object');
var addObject = document.getElementById('add-object');

var numberInputs = document.querySelectorAll('input[type="number"]');
var objectCountText = document.querySelector('.available-text');

var saveButton = document.getElementById('save');

var objectCount = document.querySelectorAll('.object').length;
if (objectCount >= 10) addObject.classList = 'unavailable';

var alertCon = document.querySelector('.alert-container');

saveButton.addEventListener('click', () => {
    var alert = document.createElement('p');
    alert.classList = 'alert success';
    alert.textContent = 'Cambios guardados.';

    var materials = { setting: 'materials', data: [] };
    var objects = document.querySelectorAll('.object');

    let lastMaterial;
    objects.forEach(material => {
        var item = {};
        item.id = material.id;

        material.childNodes.forEach(node => {
            if (node.classList) {
                if (node.classList.contains('object-name')) {
                    if (lastMaterial == node.value) return;
                    
                    lastMaterial = node.value;
                    item.name = node.value;
                }
                
                if (node.classList.contains('object-description') && lastMaterial != '-' && node.textContent != '') item.description = node.value;
            }
        });

        materials.data.push(item);
    });

    fetch(window.location.href, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(materials)
    }).then(res => {
        res.json().then(data => {
            alert.innerHTML = data.message.join('<br>');
            alert.classList = `alert ${!res.ok ? 'alert error' : 'alert success' }`;
            alertCon.appendChild(alert);
            location.reload();
        });
    });

    setTimeout(() => alert.remove(), 6000);

});

addObject.addEventListener('click', () => {
    if (addObject.classList.contains('unavailable')) return;
    objectCount++;

    objectCountText.textContent = `Materiales disponibles (${objectCount}/10)`;

    var availableObjectsDiv = document.querySelector('.objects-available');
    var newObjectDiv = document.getElementById('object-template').cloneNode(true);
    newObjectDiv.classList = 'object';
    newObjectDiv.id = generateId();

    availableObjectsDiv.appendChild(newObjectDiv);
    var newRemoveObjectBtn;

    newObjectDiv.childNodes.forEach(x => {
        if (x.nodeName == 'BUTTON') return newRemoveObjectBtn = x;
    });
    
    newRemoveObjectBtn.addEventListener('click', () => {
        newObjectDiv.remove();
        
        objectCount--;
        objectCountText.textContent = `Materiales disponibles (${objectCount}/10)`;
    });

    input = document.querySelectorAll('input');
    input.forEach(x => {
        x.addEventListener('input', resizeInput);
        resizeInput.call(x);
    });

    if (objectCount >= 10) addObject.classList = 'unavailable';

})

removeObject.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.remove();

        objectCount--;
        objectCountText.textContent = `Materiales disponibles (${objectCount}/10)`;
    });
});

input.forEach(x => {
    x.addEventListener('input', resizeInput);
    resizeInput.call(x);
});

function resizeInput() {
    if (this.value.length >= 20) return;
    this.style.width = (this.value.length + 0.5) + "ch";
}

function generateId () {
    var objects = document.querySelectorAll('.object');
    let ids = [];

    for (obj of objects) ids.push(Number(obj.id));

    var num = Math.floor(Math.random() * 9);
    return (ids.includes(num)) ? generateId() : num;
}
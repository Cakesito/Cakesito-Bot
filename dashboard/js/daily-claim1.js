var daily = document.querySelectorAll('.daily-markable');
var claim = document.querySelectorAll('.claim-markable');

daily.forEach(x => x.addEventListener('click', () => selectDaily(x)));
claim.forEach(x => x.addEventListener('click', () => selectClaim(x)));

function selectDaily (element) {
    var previous = document.getElementById('daily-selected');
    if (previous) previous.id = '';

    element.id = 'daily-selected';
}

function selectClaim (element) {
    var previous = document.getElementById('claim-selected');
    if (previous) previous.id = '';

    element.id = 'claim-selected';
}

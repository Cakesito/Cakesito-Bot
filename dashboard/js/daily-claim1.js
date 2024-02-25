const daily = document.querySelectorAll('.daily-markable');
const claim = document.querySelectorAll('.claim-markable');

daily.forEach(x => x.addEventListener('click', selectDaily));
claim.forEach(x => x.addEventListener('click', selectClaim));

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
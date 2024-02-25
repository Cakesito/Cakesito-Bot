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
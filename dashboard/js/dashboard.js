var footer = document.querySelector('.footer');
var cards = document.querySelectorAll('.card');
const mobile = window.matchMedia('(max-width: 600px)');

if (mobile.matches && cards.length > 2) footer.style.position = 'relative';
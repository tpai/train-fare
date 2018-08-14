const isRound = document.querySelector('#isRound');
const round = document.querySelector('#round');

isRound.addEventListener('click', () => {
  if (isRound.checked) {
    round.style = 'display: block';
  } else {
    round.style = 'display: none';
  }
});

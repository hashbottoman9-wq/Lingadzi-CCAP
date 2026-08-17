const gate = document.getElementById('gate');
const albumContent = document.getElementById('album-content');
const enterBtn = document.getElementById('gate-enter');
const emailInput = document.getElementById('gate-email');

if (enterBtn) {
  enterBtn.addEventListener('click', () => {
    if (!emailInput.value || !emailInput.value.includes('@')) {
      emailInput.style.borderColor = 'red';
      return;
    }
    gate.style.display = 'none';
    albumContent.classList.remove('hidden');
  });
}
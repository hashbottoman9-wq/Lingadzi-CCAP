const buttons = document.querySelectorAll('.cat-btn');
const photos = document.querySelectorAll('.photo-card');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // update active button style
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;

    photos.forEach(photo => {
      if (category === 'all' || photo.dataset.category === category) {
        photo.classList.remove('hidden');
      } else {
        photo.classList.add('hidden');
      }
    });
  });
});
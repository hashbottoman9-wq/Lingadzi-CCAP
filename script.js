// ---- Guest access gate ----
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

// ---- Watermarked download ----
function downloadWithWatermark(imgElement, filename) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = "logo.png";

  logo.onload = () => {
    const logoWidth = canvas.width * 0.15;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    const padding = canvas.width * 0.02;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logo, canvas.width - logoWidth - padding, canvas.height - logoHeight - padding, logoWidth, logoHeight);
    ctx.globalAlpha = 1;
    const link = document.createElement('a');
    link.download = filename || 'lingadzi-ccap-media.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  logo.onerror = () => {
    const link = document.createElement('a');
    link.download = filename || 'lingadzi-ccap-media.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };
}

// ---- Sub-folder tabs + gallery builder ----
// Call this from each album page, passing its own sub-folder data.
function renderAlbum(subfolders) {
  const tabNav = document.getElementById('subfolder-nav');
  const gallery = document.getElementById('gallery');

  function showSubfolder(index) {
    // update active tab
    tabNav.querySelectorAll('.cat-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // clear and rebuild gallery
    gallery.innerHTML = '';
    subfolders[index].photos.forEach((src, i) => {
      const card = document.createElement('div');
      card.className = 'photo-card';

      const img = document.createElement('img');
      img.src = src;
      img.alt = subfolders[index].name + ' photo ' + (i + 1);
      card.appendChild(img);

      const btn = document.createElement('button');
      btn.className = 'download-btn';
      btn.textContent = 'Download';
      btn.addEventListener('click', () => {
        downloadWithWatermark(img, `${subfolders[index].name}-${i + 1}.jpg`);
      });
      card.appendChild(btn);

      gallery.appendChild(card);
    });
  }

  // build tab buttons
  subfolders.forEach((folder, index) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.textContent = folder.name;
    btn.addEventListener('click', () => showSubfolder(index));
    tabNav.appendChild(btn);
  });

  showSubfolder(0); // show first sub-folder by default
}
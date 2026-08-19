bash

cat > /home/claude/script.js << 'EOF'
// ---- Helper: build photo paths from just the IMG numbers ----
function buildPaths(folder, numbers, ext) {
  ext = ext || 'JPG';
  return numbers.map(n => `photos/${folder}/IMG_${n}.${ext}`);
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

// ---- Lightbox: click a photo to view it enlarged, with next/prev ----
let currentPhotos = [];
let currentIndex = 0;

function openLightbox(photos, index) {
  currentPhotos = photos;
  currentIndex = index;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
  document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

function showNextPhoto() {
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
}

function showPrevPhoto() {
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('lightbox-close');
  const nextBtn = document.getElementById('lightbox-next');
  const prevBtn = document.getElementById('lightbox-prev');
  const lightbox = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNextPhoto);
  if (prevBtn) prevBtn.addEventListener('click', showPrevPhoto);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextPhoto();
    if (e.key === 'ArrowLeft') showPrevPhoto();
  });
});

// ---- Sub-folder tabs + gallery builder ----
function renderAlbum(subfolders) {
  const tabNav = document.getElementById('subfolder-nav');
  const gallery = document.getElementById('gallery');

  function showSubfolder(index) {
    tabNav.querySelectorAll('.cat-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    const photoList = subfolders[index].photos;
    gallery.innerHTML = '';

    photoList.forEach((src, i) => {
      const card = document.createElement('div');
      card.className = 'photo-card';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = src;
      img.alt = subfolders[index].name + ' photo ' + (i + 1);
      img.addEventListener('click', () => openLightbox(photoList, i));
      card.appendChild(img);

      const btn = document.createElement('button');
      btn.className = 'download-btn';
      btn.textContent = 'Download';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadWithWatermark(img, `${subfolders[index].name}-${i + 1}.jpg`);
      });
      card.appendChild(btn);

      gallery.appendChild(card);
    });
  }

  subfolders.forEach((folder, index) => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.textContent = folder.name;
    btn.addEventListener('click', () => showSubfolder(index));
    tabNav.appendChild(btn);
  });

  showSubfolder(0);
}
EOF
echo "done"
Output

done
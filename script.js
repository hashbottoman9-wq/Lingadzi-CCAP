// ---- Helper: build photo paths from just the IMG numbers ----
function buildPaths(folder, numbers, ext) {
  ext = ext || 'JPG';
  var paths = [];
  for (var i = 0; i < numbers.length; i++) {
    paths.push('photos/' + folder + '/IMG_' + numbers[i] + '.' + ext);
  }
  return paths;
}

// ---- Watermarked download ----
function downloadWithWatermark(imgElement, filename) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  var logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = "logo.png";

  logo.onload = function () {
    var logoWidth = canvas.width * 0.15;
    var logoHeight = (logo.height / logo.width) * logoWidth;
    var padding = canvas.width * 0.02;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logo, canvas.width - logoWidth - padding, canvas.height - logoHeight - padding, logoWidth, logoHeight);
    ctx.globalAlpha = 1;
    var link = document.createElement('a');
    link.download = filename || 'lingadzi-ccap-media.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  logo.onerror = function () {
    var link = document.createElement('a');
    link.download = filename || 'lingadzi-ccap-media.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };
}

// ---- Lightbox: click a photo to view it enlarged, with next/prev ----
var currentPhotos = [];
var currentIndex = 0;

function openLightbox(photos, index) {
  currentPhotos = photos;
  currentIndex = index;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
  document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

function downloadCurrentLightboxPhoto() {
  var img = document.getElementById('lightbox-img');
  var tempImg = new Image();
  tempImg.crossOrigin = "anonymous";
  tempImg.onload = function () {
    downloadWithWatermark(tempImg, 'lingadzi-ccap-' + (currentIndex + 1) + '.jpg');
  };
  tempImg.src = img.src;
}

function showNextPhoto() {
  currentIndex = (currentIndex + 1) % currentPhotos.length;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
}

function showPrevPhoto() {
  currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
  document.getElementById('lightbox-img').src = currentPhotos[currentIndex];
}

document.addEventListener('DOMContentLoaded', function () {
  var closeBtn = document.getElementById('lightbox-close');
  var nextBtn = document.getElementById('lightbox-next');
  var prevBtn = document.getElementById('lightbox-prev');
  var downloadBtn = document.getElementById('lightbox-download');
  var lightbox = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNextPhoto);
  if (prevBtn) prevBtn.addEventListener('click', showPrevPhoto);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadCurrentLightboxPhoto);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextPhoto();
    if (e.key === 'ArrowLeft') showPrevPhoto();
  });
});

// ---- Sub-folder tabs + gallery builder ----
function renderAlbum(subfolders) {
  var tabNav = document.getElementById('subfolder-nav');
  var gallery = document.getElementById('gallery');

  function showSubfolder(index) {
    var allTabs = tabNav.querySelectorAll('.cat-btn');
    for (var t = 0; t < allTabs.length; t++) {
      if (t === index) {
        allTabs[t].classList.add('active');
      } else {
        allTabs[t].classList.remove('active');
      }
    }

    var photoList = subfolders[index].photos;
    gallery.innerHTML = '';

    for (var i = 0; i < photoList.length; i++) {
      (function (src, i) {
        var card = document.createElement('div');
        card.className = 'photo-card';

        var img = document.createElement('img');
        img.loading = 'lazy';
        img.src = src;
        img.alt = subfolders[index].name + ' photo ' + (i + 1);
        img.addEventListener('click', function () {
          openLightbox(photoList, i);
        });
        card.appendChild(img);

        var btn = document.createElement('button');
        btn.className = 'download-btn';
        btn.textContent = 'Download';
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          downloadWithWatermark(img, subfolders[index].name + '-' + (i + 1) + '.jpg');
        });
        card.appendChild(btn);

        gallery.appendChild(card);
      })(photoList[i], i);
    }
  }

  for (var index = 0; index < subfolders.length; index++) {
    (function (folder, index) {
      var btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.textContent = folder.name;
      btn.addEventListener('click', function () {
        showSubfolder(index);
      });
      tabNav.appendChild(btn);
    })(subfolders[index], index);
  }

  showSubfolder(0);
}
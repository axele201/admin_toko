function updateClock() {
  const now = new Date();
  const options = { timeZone: 'Asia/Jakarta', hour12: false };
  const timeString = now.toLocaleTimeString('id-ID', options);
  document.getElementById('clock').textContent = timeString + " WIB";
}
setInterval(updateClock, 1000);
updateClock();

// Toggle sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
}

function loadPage(page, title = null) {
  $('#content-container').load(page, function () {
    var titleText = title || page.replace('.html', '').toUpperCase();
    $('#page-title').text(titleText);
    $('#breadcrumb-title').text(titleText);

    $('.nav-link').removeClass('active');
    $(`.nav-link[onclick*="${page}"]`).addClass('active');

    // Fungsi untuk load dan inject script
    function loadScript(pageKey, scriptPath, callbackName = null) {
      // Periksa apakah skrip sudah dimuat untuk halaman yang sama
      const existingScript = document.querySelector(`script[data-page="${pageKey}"]`);
      if (existingScript) {
        existingScript.remove(); // Hapus skrip sebelumnya jika ada
      }

      // Buat elemen script baru
      const script = document.createElement('script');
      script.src = scriptPath;
      script.dataset.page = pageKey;

      // Setelah skrip dimuat, panggil callback jika ada
      script.onload = () => {
        if (callbackName && typeof window[callbackName] === "function") {
          window[callbackName](); // Panggil fungsi callback jika ada
        }
      };

      // Tambahkan skrip ke halaman
      document.body.appendChild(script);
    }

    // Memuat skrip sesuai dengan halaman yang aktif
    if (page === '/content/product.html') {
      loadScript('product', 'asset/JS/product.js', 'loadProductData');
    } else if (page === 'payments.html') {
      loadScript('payments', 'public/payments.js', 'loadPaymentData');
    } else if (page === 'statistics.html') {
      loadScript('statistics', 'public/statistics.js', 'loadStatisticsData');
    }

  });
}
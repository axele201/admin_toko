const scriptURL = 'https://script.google.com/macros/s/AKfycbwcc2jqCygzX5VH86BanZ41BgnjEBytvs_DVWR7kN-zv1dn3zmYtNvItH8Ru-qzraQ/exec';
const form = document.getElementById('productForm');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = submitBtn.querySelector('.btn-text');
const submitBtnSpinner = submitBtn.querySelector('.spinner-border');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtnText.classList.add('d-none');
    submitBtnSpinner.classList.remove('d-none');

    try {
      const nama_product = form.nama_product.value.trim();
      const variant = form.variant.value.trim();
      const harga = form.harga.value.trim();
      const fileInput = form.gambar;
      const file = fileInput.files[0];
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp', 'svg', 'cr2', 'dng', 'pdf', 'psd', 'eps', 'ai'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!nama_product || !variant || !harga) {
        alert("Semua field harus diisi.");
        resetButton();
        return;
      }

      if (isNaN(harga) || Number(harga) <= 0) {
        alert("Harga harus berupa angka positif.");
        resetButton();
        return;
      }

      if (!file) {
        alert("Silakan pilih gambar.");
        resetButton();
        return;
      }

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Ekstensi file tidak diperbolehkan.");
        resetButton();
        return;
      }

      const reader = new FileReader();
      reader.onload = async function () {
        const base64Image = reader.result.split(',')[1];
        const formData = new FormData();

        formData.append('nama_product', nama_product);
        formData.append('variant', variant);
        formData.append('harga', harga);
        formData.append('fileName', file.name);
        formData.append('base64', base64Image);

        try {
          const response = await fetch(scriptURL, {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          console.log('Success!', result);
          alert("Produk berhasil dikirim!");
          form.reset();
          loadProductData();

        } catch (error) {
          console.error('Error!', error.message);
          alert("Gagal mengirim produk.");
        } finally {
          resetButton();
        }
      };

      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      resetButton();
    }
  });
}

// Fungsi untuk mengembalikan tombol ke normal
function resetButton() {
  submitBtn.disabled = false;
  submitBtnText.classList.remove('d-none');
  submitBtnSpinner.classList.add('d-none');
}


async function tampilkanProduk() {
  try {
    const response = await fetch(scriptURL);
    const products = await response.json();
    console.log(products);

    const container = document.getElementById('produkContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!Array.isArray(products)) {
      console.error('Data produk bukan array:', products);
      return;
    }

    products.forEach(item => {
      const hargaFormatted = parseInt(item.harga).toLocaleString('id-ID');
      const card = `
                    <div class="col-md-4 d-flex">
                      <div class="product-card bg-white shadow-sm p-3 w-100 d-flex flex-column">
                        <div class="d-flex gap-3 mb-3">
                          <div class="product-card__image-container flex-shrink-0" style="width: 120px; height: 120px;">
                            <img src="${item.gambar}" 
                                  alt="Product Image" 
                                  style="width: 120px; height: 120px; object-fit: cover; border: 1px solid #ccc;" 
                                  onerror="this.onerror=null;this.src='/asset/img/no-image.png';" />
                          </div>
                          <div class="product-info d-flex flex-column flex-grow-1">
                            <div class="fw-bold fs-5 mb-2">${item.nama_product}</div>
                            <div class="mb-2">Varian:
                              <button class="btn btn-outline-secondary btn-sm">${item.variant}</button>
                            </div>
                            <div class="fw-semibold text-primary mb-3">Rp. ${hargaFormatted}</div>
                          </div>
                        </div>
                        <div class="mt-auto d-flex gap-2">
                          <button class="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2">
                            <i class="bi bi-pencil-square"></i> Edit
                          </button>
                          <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2">
                            <i class="bi bi-trash"></i> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
      container.innerHTML += card;
    });
  } catch (err) {
    console.error('Gagal memuat produk:', err);
  }
}
function loadProductData() {
  tampilkanProduk();
}

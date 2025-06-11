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
      const kategori = form.kategori.value.trim();
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

      if (!kategori) {
        alert("Silakan pilih kategori.");
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
        formData.append('kategori', kategori);
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
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Produk berhasil ditambahkan.',
            timer: 1500,
            showConfirmButton: false
          });
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

function resetButton() {
  submitBtn.disabled = false;
  submitBtnText.classList.remove('d-none');
  submitBtnSpinner.classList.add('d-none');
}

function renderProduk(products) {
  const container = document.getElementById('produkContainer');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<div class="text-center text-muted">Tidak ada produk ditemukan.</div>';
    return;
  }

  products.forEach(item => {
    const hargaFormatted = parseInt(item.harga).toLocaleString('id-ID');
    const card = `
      <div class="col-md-4 d-flex">
        <div class="product-card bg-white shadow-sm p-3 w-100 d-flex flex-column justify-content-between">
          <div class="d-flex gap-3 mb-3">
            <div class="product-card__image-container flex-shrink-0" style="width: 120px; height: 120px;">
              <img src="${item.gambar}" 
                   alt="Product Image" 
                   style="width: 120px; height: 120px; object-fit: cover; border: 1px solid #ccc;" 
                   onerror="this.onerror=null;this.src='/asset/img/no-image.png';" />
            </div>
            <div class="product-info d-flex flex-column flex-grow-1">
              <div class="fw-bold fs-5 mb-2 text-truncate" title="${item.nama_product}">${item.nama_product}</div>
              <div class="mb-2">Kategori:
                <span class="badge bg-info">${item.kategori}</span>
              </div>
              <div class="mb-2">Varian:
                <span class="badge bg-secondary">${item.variant}</span>
              </div>
              <div class="fw-semibold text-primary mb-3">Rp. ${hargaFormatted}</div>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2" 
              onclick="bukaModalEdit('${item.id}', '${item.nama_product}', '${item.kategori}', '${item.variant}', '${item.harga}')">
              <i class="bi bi-pencil-square"></i> Edit
            </button>

            <button class="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2"
              onclick="hapusProduk('${item.id}')">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

let cachedProducts = [];  // Cache data global
let pageSize = 8;
let currentPage = 1;

async function tampilkanProduk() {
  try {
    const response = await fetch(scriptURL);
    const products = await response.json();
    console.log(products);

    cachedProducts = products;
    setupKategoriDropdown(products);
    applyFilter(); // Render awal

  } catch (err) {
    console.error('Gagal memuat produk:', err);
  }
}

function setupKategoriDropdown(products) {
  const filterDropdown = document.getElementById('filterKategori');
  filterDropdown.innerHTML = '<option value="">Semua Kategori</option>';

  const kategoriSet = new Set(products.map(p => p.kategori));
  kategoriSet.forEach(kat => {
    const option = document.createElement('option');
    option.value = kat;
    option.textContent = kat;
    filterDropdown.appendChild(option);
  });

  filterDropdown.onchange = () => {
    currentPage = 1;
    applyFilter();
  };

  document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    applyFilter();
  });
}

function applyFilter() {
  const searchKeyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const kategoriFilter = document.getElementById('filterKategori').value;

  let filtered = cachedProducts.filter(item => {
    const cocokNama = item.nama_product.toLowerCase().includes(searchKeyword);
    const cocokKategori = !kategoriFilter || item.kategori === kategoriFilter;
    return cocokNama && cocokKategori;
  });

  renderPagination(filtered);
  renderProduk(filtered.slice((currentPage-1)*pageSize, currentPage*pageSize));
}

function renderPagination(filtered) {
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginationContainer = document.getElementById('paginationContainer');
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = i;
      applyFilter();
    });
    paginationContainer.appendChild(li);
  }
}



async function hapusProduk(id) {
  Swal.fire({
    title: 'Yakin ingin menghapus?',
    text: "Data produk akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const deleteUrl = `${scriptURL}?id=${id}&action=delete`;
        const response = await fetch(deleteUrl);
        const result = await response.json();

        if (result.result === 'success') {
          Swal.fire('Berhasil!', 'Produk berhasil dihapus.', 'success');
          loadProductData();
        } else {
          Swal.fire('Gagal!', 'Produk tidak ditemukan.', 'error');
        }
      } catch (error) {
        console.error('Gagal menghapus produk:', error);
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  });
}


function bukaModalEdit(id, nama_product, kategori, variant, harga) {
  document.getElementById('editId').value = id;
  document.getElementById('editNamaProduct').value = nama_product;
  document.getElementById('editKategori').value = kategori;
  document.getElementById('editVariant').value = variant;
  document.getElementById('editHarga').value = harga;

  const modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

document.getElementById('editForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const nama_product = document.getElementById('editNamaProduct').value.trim();
  const kategori = document.getElementById('editKategori').value.trim();
  const variant = document.getElementById('editVariant').value.trim();
  const harga = document.getElementById('editHarga').value.trim();

  const formData = new FormData();
  formData.append('action', 'update');
  formData.append('id', id);
  formData.append('nama_product', nama_product);
  formData.append('kategori', kategori);
  formData.append('variant', variant);
  formData.append('harga', harga);

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.result === 'success') {
      Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Produk berhasil diperbarui.',
                timer: 1500,
                showConfirmButton: false
              });

      loadProductData();

      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
      modal.hide();
    } else {
      alert("Gagal memperbarui produk.");
    }
  } catch (error) {
    console.error("Error update:", error);
    alert("Terjadi kesalahan saat update.");
  }
});

function loadProductData() {
  tampilkanProduk();
}

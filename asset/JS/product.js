const scriptURL = 'https://script.google.com/macros/s/AKfycbwcc2jqCygzX5VH86BanZ41BgnjEBytvs_DVWR7kN-zv1dn3zmYtNvItH8Ru-qzraQ/exec';
const form = document.getElementById('productForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

const nama_product = form.nama_product.value.trim();
  const variant = form.variant.value.trim();
  const harga = form.harga.value.trim();
  const fileInput = form.gambar;
  const file = fileInput.files[0];
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp', 'svg', 'cr2', 'dng', 'pdf', 'psd', 'eps', 'ai'];
  const fileExtension = file.name.split('.').pop().toLowerCase();

  // Validasi input kosong
  if (!nama_product || !variant || !harga) {
    alert("Semua field harus diisi.");
    return;
  }

  // Validasi harga angka positif
  if (isNaN(harga) || Number(harga) <= 0) {
    alert("Harga harus berupa angka positif.");
    return;
  }

  // Validasi gambar wajib (jika ingin)
  if (!file) {
    alert("Silakan pilih gambar.");
    return;
  }
  if (!allowedExtensions.includes(fileExtension)) {
    alert("Ekstensi file tidak diperbolehkan.");
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
    formData.append('mimeType', file.type);
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

    } catch (error) {
      console.error('Error!', error.message);
      alert("Gagal mengirim produk.");
    }
  };

  reader.readAsDataURL(file);
});

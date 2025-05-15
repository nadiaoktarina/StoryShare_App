export default class NotFoundPage {
  render() {
    return `
      <section class="not-found-container">
        <div class="not-found-content">
          <h1 class="not-found-title">404</h1>
          <p class="not-found-subtitle">Halaman tidak ditemukan</p>
          <p class="not-found-message">Sepertinya alamat yang kamu tuju salah atau tidak tersedia.</p>
          <a href="#/" class="not-found-button">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }
}

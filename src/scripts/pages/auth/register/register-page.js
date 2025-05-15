import RegisterPresenter from "./register-presenter";
import * as StoryAppApi from "../../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container">
        <article class="register-form-container">
          <h1 class="register__title">Buat Akun Baru 👤</h1>
          <p class="register__subtitle">Lengkapi data diri Anda untuk membuat akun</p>
  
          <form id="register-form" class="register-form">
            <div class="form-group">
              <label for="name-input" class="form-label">Nama Lengkap</label>
              <input id="name-input" type="text" name="name" class="form-input" placeholder="Masukkan nama lengkap Anda" required>
            </div>
  
            <div class="form-group">
              <label for="email-input" class="form-label">Email</label>
              <input id="email-input" type="email" name="email" class="form-input" placeholder="Contoh: nama@email.com" required>
            </div>
  
            <div class="form-group">
              <label for="password-input" class="form-label">Password</label>
              <input id="password-input" type="password" name="password" class="form-input" placeholder="Masukkan password baru" required>
            </div>
  
            <div class="form-actions">
              <div id="submit-button-container">
                <button id="register-submit-btn" class="btn-primary" type="submit">Daftar Akun</button>
              </div>
              <p class="form-text">
                Sudah punya akun? <a href="#/login" class="link">Masuk di sini</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAppApi,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          name: document.getElementById("name-input").value,
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getRegistered(data);
      });
  }

  registeredSuccessfully(message) {
    console.log(message);

    // Redirect
    location.hash = "/login";
  }

  registeredFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Daftar akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Daftar akun</button>
    `;
  }
}

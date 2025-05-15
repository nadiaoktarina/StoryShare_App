import LoginPresenter from "./login-presenter";
import * as StoryAppApi from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-container">
        <article class="login-form-container">
          <h1 class="login__title">Selamat Datang 👋</h1>
          <p class="login__subtitle">Masuk ke akun Anda untuk mulai beraktivitas</p>
  
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label for="email-input" class="form-label">Email</label>
              <input id="email-input" type="email" name="email" class="form-input" placeholder="nama@email.com" required>
            </div>
  
            <div class="form-group">
              <label for="password-input" class="form-label">Password</label>
              <input id="password-input" type="password" name="password" class="form-input" placeholder="••••••••" required>
            </div>
  
            <div class="form-actions">
              <div id="submit-button-container">
                <button id="login-submit-btn" class="btn-primary" type="submit">Masuk</button>
              </div>
              <p class="form-text">
                Belum punya akun? <a href="#/register" class="link">Daftar di sini</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAppApi,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getLogin(data);
      });
  }

  loginSuccessfully(message) {
    console.log(message);

    // Redirect
    location.hash = "/";
  }

  loginFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Masuk
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }
}

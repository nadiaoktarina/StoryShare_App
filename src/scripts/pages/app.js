import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";
import { routes } from "../routes/routes";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";
import NotFoundPage from "../pages/not-found/not-found-page";

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;
  #currentUrl;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;
    this.#currentUrl = null;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#setupNavigationList();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.#drawerNavigation.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      const isInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isInsideButton = this.#drawerButton.contains(event.target);

      if (!isInsideDrawer && !isInsideButton) {
        this.#drawerNavigation.classList.remove("open");
      }
    });

    this.#drawerNavigation.addEventListener("click", (event) => {
      const navLink = event.target.closest("a");
      if (navLink) {
        this.#drawerNavigation.classList.remove("open");
      }
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain =
      this.#drawerNavigation.querySelector("[name='navlist-main']") ||
      this.#drawerNavigation.children.namedItem("navlist-main");
    const navList =
      this.#drawerNavigation.querySelector("[name='navlist']") ||
      this.#drawerNavigation.children.namedItem("navlist");

    // Perbaikan di sini
    if (navListMain) {
      navListMain.innerHTML = isLogin
        ? generateMainNavigationListTemplate()
        : "";
    }

    if (navList) {
      navList.innerHTML = isLogin
        ? generateAuthenticatedNavigationListTemplate()
        : generateUnauthenticatedNavigationListTemplate();
    }

    this.#setupLogoutButton();
  }

  #setupLogoutButton() {
    const logoutButton = document.getElementById("logout-button");

    // Pastikan tombol logout ada sebelum menambah event listener
    if (logoutButton) {
      const newLogoutButton = logoutButton.cloneNode(true); // Mengganti tombol logout
      logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);

      // Event listener untuk logout
      newLogoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar?")) {
          getLogout(); // Menghapus token

          // Update menu navigasi setelah logout
          this.#setupNavigationList();

          // Redirect ke halaman login
          location.hash = "/login";
        }
      });
    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools",
    );
    if (!pushNotificationTools) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        ?.addEventListener("click", () => {
          unsubscribe().finally(() => this.#setupPushNotification());
        });
    } else {
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      document
        .getElementById("subscribe-button")
        ?.addEventListener("click", () => {
          subscribe().finally(() => this.#setupPushNotification());
        });
    }
  }

  async renderPage() {
    const url = getActiveRoute();

    if (this.#currentUrl === url) return;
    this.#currentUrl = url;

    const route = routes[url];
    const page = route ? route() : new NotFoundPage();

    if (!page || typeof page.render !== "function") {
      this.#content.innerHTML = `
        <div class="error-container">
          <h2>500 - Internal Server Error</h2>
          <p>Failed to load the page.</p>
          <a href="#/">Return to Home</a>
        </div>`;
      return;
    }

    try {
      const transition = transitionHelper({
        updateDOM: async () => {
          const rendered = await page.render();
          this.#content.innerHTML = rendered;

          this.#setupNavigationList();

          if (typeof page.afterRender === "function") {
            await page.afterRender();
          }

          if (isServiceWorkerAvailable()) {
            await this.#setupPushNotification();
          }
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      });
    } catch (error) {
      console.error("Page rendering error:", error);
      this.#content.innerHTML = `
        <div class="error-container">
          <h2>Error Loading Page</h2>
          <p>There was a problem loading the content. Please try again.</p>
        </div>`;
    }
  }
}

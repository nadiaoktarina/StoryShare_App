import { showFormattedDate } from "./utils";

export function generateLoaderAbsoluteTemplate() {
  return `<div class="loader loader-absolute"></div>`;
}

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/">Daftar Cerita</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Cerita Tersimpan</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-story-button" class="btn new-story-button" href="#/tambah">Buat Cerita <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Belum ada cerita yang dapat ditampilkan saat ini.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${
        message
          ? message
          : "Coba periksa jaringan Anda atau laporkan error ini."
      }</p>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan pengambilan detail cerita</h2>
      <p>${
        message
          ? message
          : "Coba periksa jaringan Anda atau laporkan error ini."
      }</p>
    </div>
  `;
}

export function generateStoryItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
}) {
  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img class="story-item__image" src="${photoUrl}" alt="${description}">
      <div class="story-item__body">
        <h2 id="story-description" class="story-item__description">${description}</h2>
        <div class="story-item__more-info">
          <div class="story-item__author"><i class="fas fa-user"></i> ${name}</div>
          <div class="story-item__createdat"><i class="fas fa-calendar-alt"></i> ${showFormattedDate(
            createdAt,
            "id-ID",
          )}</div>
          ${
            lat !== undefined && lon !== undefined
              ? `
            <div class="story-item__location">
              <i class="fas fa-map-marker-alt"></i> (${lat}, ${lon})
            </div>`
              : ""
          }
        </div>
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

export function generateStoryDetailTemplate({
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
  address, // Tambahan dari fungsi sebelumnya
}) {
  const createdAtFormatted = showFormattedDate(createdAt, "id-ID");

  return `
    <div class="story-detail__header">
      <h1 id="description" class="story-detail__description">${description}</h1>

      <div class="story-detail__more-info">
        <div class="story-detail__author" data-value="${name}">
          <i class="fas fa-user"></i> ${name}
        </div>
        <div class="story-detail__createdat" data-value="${createdAtFormatted}">
          <i class="fas fa-calendar-alt"></i> ${createdAtFormatted}
        </div>
        ${
          lat !== undefined && lon !== undefined
            ? `
          <div class="story-detail__location">
            <i class="fas fa-map-marker-alt"></i> Latitude: ${lat}, Longitude: ${lon}<br>
            <small>${address || ""}</small>
          </div>`
            : ""
        }
      </div>
    </div>

    <div class="container">
      <div class="story-detail__image-container">
        <img class="story-detail__image" src="${photoUrl}" alt="${description}">
      </div>

      ${
        lat !== undefined && lon !== undefined
          ? `<div id="map" class="story-detail__map" style="height: 300px; margin-top: 16px;"></div>`
          : ""
      }
    </div>

    <hr>
  
        <div class="story-detail__body__actions__container">
          <h2>Aksi</h2>
          <div class="story-detail__actions__buttons">
            <div id="save-actions-container"></div>
          </div>
        </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="btn btn-transparent">
      Simpan laporan <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent">
      Buang laporan <i class="fas fa-bookmark"></i>
    </button>
  `;
}

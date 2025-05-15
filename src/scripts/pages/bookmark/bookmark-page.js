import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";
import BookmarkPresenter from "./bookmark-presenter";
import Database from "../../data/database";
import { initializeMap, addMarkersToMap } from "../../utils/maps";

export default class BookmarkPage {
  #presenter = null;
  #map = null;

  constructor() {
    // Inisialisasi presenter saat objek dibuat, bukan dalam afterRender
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });
  }

  async render() {
    return `

      <section class="container">
        <h1 class="section-title">Daftar Cerita Tersimpan</h1>
        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>

      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    try {
      // Hapus setTimeout dan gunakan Promise langsung
      await this.#presenter.initialGalleryAndMap();
    } catch (error) {
      console.error("Error during page initialization:", error);
      this.populateBookmarkedStoryError(
        "Terjadi kesalahan saat memuat halaman",
      );
    }
  }

  populateBookmarkedStory(message, stories) {
    // Pastikan elemen DOM sudah ada sebelum mencoba mengakses
    const bookmarkedListContainer = document.getElementById("stories-list");
    if (!bookmarkedListContainer) {
      console.error("Elemen #stories-list tidak ditemukan.");
      return;
    }

    // Pastikan stories adalah array dan tidak kosong
    if (!Array.isArray(stories) || stories.length <= 0) {
      this.populateBookmarkedStoryEmpty();
      return;
    }

    try {
      const html = stories.reduce((accumulator, story) => {
        return accumulator.concat(
          generateStoryItemTemplate({
            ...story,
          }),
        );
      }, "");

      bookmarkedListContainer.innerHTML = `<div class="stories-list">${html}</div>`;

      // Pastikan stories memiliki koordinat sebelum mencoba menambahkan marker
      const storiesWithCoords = stories.filter(
        (story) => story && story.lat !== undefined && story.lon !== undefined,
      );

      if (storiesWithCoords.length > 0) {
        this.addMarkersToMap(storiesWithCoords);
      }
    } catch (error) {
      console.error("Error populating stories list:", error);
      this.populateBookmarkedStoryError(
        "Terjadi kesalahan saat menampilkan cerita",
      );
    }
  }

  populateBookmarkedStoryEmpty() {
    const bookmarkedListContainer = document.getElementById("stories-list");
    if (bookmarkedListContainer) {
      bookmarkedListContainer.innerHTML = generateStoriesListEmptyTemplate();
    } else {
      console.error("Elemen #stories-list tidak ditemukan.");
    }
  }

  populateBookmarkedStoryError(message) {
    const bookmarkedListContainer = document.getElementById("stories-list");
    if (bookmarkedListContainer) {
      bookmarkedListContainer.innerHTML = generateStoriesListErrorTemplate(
        message || "Terjadi kesalahan",
      );
    } else {
      console.error("Elemen #stories-list tidak ditemukan.");
    }
  }

  async initialMap() {
    try {
      if (!this.#map) {
        const mapElement = document.getElementById("map");
        if (!mapElement) {
          console.error("Elemen #map tidak ditemukan.");
          return null;
        }
        this.#map = initializeMap("map", [-6.352052, 106.83252], 8);
      }
      return this.#map;
    } catch (error) {
      console.error("Error initializing map:", error);
      return null;
    }
  }

  async addMarkersToMap(stories) {
    try {
      if (!this.#map) {
        this.#map = await this.initialMap();
        if (!this.#map) return; // Jika map masih null setelah initialMap
      }

      // Fallback jika tidak ada stories dengan koordinat
      if (!stories || stories.length === 0) {
        stories = [{ lat: -6.352052, lon: 106.83252, name: "Default Marker" }];
      }

      addMarkersToMap(this.#map, stories);
    } catch (error) {
      console.error("Error adding markers to map:", error);
    }
  }

  showMapLoading() {
    const loadingContainer = document.getElementById("map-loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    } else {
      console.warn("Elemen #map-loading-container tidak ditemukan.");
    }
  }

  hideMapLoading() {
    const loadingContainer = document.getElementById("map-loading-container");
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    } else {
      console.warn("Elemen #map-loading-container tidak ditemukan.");
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById(
      "stories-list-loading-container",
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    } else {
      console.warn("Elemen #stories-list-loading-container tidak ditemukan.");
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById(
      "stories-list-loading-container",
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    } else {
      console.warn("Elemen #stories-list-loading-container tidak ditemukan.");
    }
  }
}

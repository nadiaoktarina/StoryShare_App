import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";
import HomePresenter from "./home-presenter";
import * as StoryAppApi from "../../data/api";
import { initializeMap, addMarkersToMap } from "../../utils/maps";

export default class HomePage {
  #presenter = null;
  #map = null;

  constructor() {
    // Inisialisasi presenter saat objek dibuat, bukan dalam afterRender
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAppApi,
    });
  }

  async render() {
    return `

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>
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
      this.populateStoriesListError("Terjadi kesalahan saat memuat halaman");
    }
  }

  populateStoriesList(message, stories) {
    // Pastikan elemen DOM sudah ada sebelum mencoba mengakses
    const storiesListContainer = document.getElementById("stories-list");
    if (!storiesListContainer) {
      console.error("Elemen #stories-list tidak ditemukan.");
      return;
    }

    // Pastikan stories adalah array dan tidak kosong
    if (!Array.isArray(stories) || stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    try {
      const html = stories.reduce((accumulator, story) => {
        return accumulator.concat(
          generateStoryItemTemplate({
            ...story,
          })
        );
      }, "");

      storiesListContainer.innerHTML = `<div class="stories-list">${html}</div>`;

      // Pastikan stories memiliki koordinat sebelum mencoba menambahkan marker
      const storiesWithCoords = stories.filter(
        (story) => story && story.lat !== undefined && story.lon !== undefined
      );

      if (storiesWithCoords.length > 0) {
        this.addMarkersToMap(storiesWithCoords);
      }
    } catch (error) {
      console.error("Error populating stories list:", error);
      this.populateStoriesListError(
        "Terjadi kesalahan saat menampilkan cerita"
      );
    }
  }

  populateStoriesListEmpty() {
    const storiesListContainer = document.getElementById("stories-list");
    if (storiesListContainer) {
      storiesListContainer.innerHTML = generateStoriesListEmptyTemplate();
    } else {
      console.error("Elemen #stories-list tidak ditemukan.");
    }
  }

  populateStoriesListError(message) {
    const storiesListContainer = document.getElementById("stories-list");
    if (storiesListContainer) {
      storiesListContainer.innerHTML = generateStoriesListErrorTemplate(
        message || "Terjadi kesalahan"
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
      "stories-list-loading-container"
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    } else {
      console.warn("Elemen #stories-list-loading-container tidak ditemukan.");
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById(
      "stories-list-loading-container"
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    } else {
      console.warn("Elemen #stories-list-loading-container tidak ditemukan.");
    }
  }
}

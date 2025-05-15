import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from "../../templates";
import { createCarousel } from "../../utils";
import StoryDetailPresenter from "./detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import * as StoryAppApi from "../../data/api";
import Database from "../../data/database";
import {
  initializeMap,
  addMarkersToMap,
  getLocationDetails,
} from "../../utils/maps";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section class="story-detail-section">
        <div class="container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container" class="loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoryAppApi,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitializeMap(message, story) {
    const storyDetailElement = document.getElementById("story-detail");

    if (!storyDetailElement) {
      console.error("Elemen 'story-detail' tidak ditemukan di DOM.");
      return;
    }

    let address = "";
    if (story.lat && story.lon) {
      try {
        address = await getLocationDetails(story.lat, story.lon);
      } catch (error) {
        console.error("Error getting location details:", error);
        address = "Lokasi tidak tersedia";
      }
    }

    // Prepare photo URLs array if needed for carousel
    const photoUrls = Array.isArray(story.photoUrl)
      ? story.photoUrl
      : [story.photoUrl];

    storyDetailElement.innerHTML = generateStoryDetailTemplate({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: photoUrls,
      createdAt: story.createdAt,
      lat: story.lat,
      lon: story.lon,
      address: address,
    });

    // Tunggu satu tick agar DOM update
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Initialize map if coordinates are available
    if (story.lat && story.lon) {
      // Pastikan map diinisialisasi terlebih dahulu
      await this.initialMap(story);

      // Hanya tambahkan marker jika map sudah diinisialisasi
      if (this.#map) {
        this.addMarkerToMap(story);
      }
    }

    // Initialize carousel if there are multiple images
    if (photoUrls.length > 1) {
      const carouselElement = document.getElementById("story-images-carousel");
      if (carouselElement) {
        createCarousel(carouselElement);
      }
    }

    // Hanya tampilkan tombol save
    this.#presenter.showSaveButton();
  }

  async initialMap(story) {
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.warn("Elemen map tidak ditemukan di DOM");
      return null;
    }

    try {
      if (!this.#map) {
        if (story?.lat !== undefined && story?.lon !== undefined) {
          this.#map = initializeMap("map", [story.lat, story.lon], 15);
        } else {
          this.#map = initializeMap("map", [-6.352052, 106.83252], 15);
        }
      }
      return this.#map;
    } catch (error) {
      console.error("Error initializing map:", error);
      return null;
    }
  }

  // Metode perbaikan untuk menambahkan marker
  addMarkerToMap(story) {
    if (!story || !story.lat || !story.lon) {
      console.warn(
        "Tidak dapat menambahkan marker: Data cerita tidak valid atau koordinat tidak tersedia",
      );
      return;
    }

    if (!this.#map) {
      console.warn("Tidak dapat menambahkan marker: Map belum diinisialisasi");
      return;
    }

    const stories = [story];
    addMarkersToMap(this.#map, stories);
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container",
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById(
      "map-loading-container",
    );
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = "";
    }
  }

  showStoryDetailLoading() {
    const loadingContainer = document.getElementById(
      "story-detail-loading-container",
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideStoryDetailLoading() {
    const loadingContainer = document.getElementById(
      "story-detail-loading-container",
    );
    if (loadingContainer) {
      loadingContainer.innerHTML = "";
    }
  }

  populateStoryDetailError(message) {
    const storyDetailElement = document.getElementById("story-detail");
    if (storyDetailElement) {
      storyDetailElement.innerHTML = generateStoryDetailErrorTemplate(message);
    }
  }

  renderSaveButton() {
    const saveActionsContainer = document.getElementById(
      "save-actions-container",
    );
    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateSaveStoryButtonTemplate();
    }
    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        await this.#presenter.saveStory();
        await this.#presenter.showSaveButton();
      });
  }
  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateRemoveStoryButtonTemplate();

    document
      .getElementById("story-detail-remove")
      .addEventListener("click", async () => {
        await this.#presenter.removeStory();
        await this.#presenter.showSaveButton();
      });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }

  removeFromBookmarkFailed(message) {
    alert(message);
  }
}

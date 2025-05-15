import NewPresenter from "./tambah-presenter";
import { convertBase64ToBlob } from "../../utils";
import * as StoryAppApi from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";
import Camera from "../../utils/camera";
import { initializeMap } from "../../utils/maps";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { storeNewStory } from "../../data/api";

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenStories = [];
  #map;
  #marker;
  #galleryCanvas;

  async render() {
    return `
      <section class="new-story__header">
        <div class="container">
          <h1 class="new-story__header__title">Buat Story Baru</h1>
          <p class="new-story__header__description">
            Silakan lengkapi formulir di bawah dan buat story terbaik mu.<br>
            Pastikan story yang dibuat adalah karya mu sendiri.
          </p>
        </div>
      </section>
  
      <main id="main-content" class="container" role="main">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Tulis Ceritamu</label>
              <div class="new-form__description__container">
                <textarea 
                  id="description-input" 
                  name="description" 
                  placeholder="Masukkan Cerita terbaikmu. anda dapat menjelaskan apa kejadian, pengalaman, dll."
                ></textarea>
              </div>
            </div>
  
            <div class="form-control">
              <label for="stories-input" class="new-form_stories__title">Dokumentasi.</label>
              <div id="stories-more-info">Anda dapat menyertakan foto sebagai dokumentasi gambaran ceritamu.</div>
              <div class="new-form__stories__container">
                <div class="new-form__stories__buttons">
                  <button id="stories-input-button" class="btn btn-outline" type="button">Ambil Gambar</button>
                  <input 
                    id="stories-input" 
                    name="stories" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    hidden="hidden" 
                    aria-multiline="true" 
                    aria-describedby="stories-more-info"
                  >
                  <button id="open-stories-camera-button" class="btn btn-outline" type="button">Buka Kamera</button>
                </div>
  
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">Aliran video tidak tersedia.</video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
                  <div class="new-form__camera__tools">
                    <select id="camera-select" aria-label="Pilih kamera"></select>
                    <div class="new-form__camera__tools_buttons">
                      <button id="camera-take-button" class="btn" type="button">Ambil Gambar</button>
                    </div>
                  </div>
                </div>
  
                <canvas id="gallery-canvas" class="new-form__gallery__canvas" hidden></canvas>
                <ul id="stories-taken-list" class="new-form__stories__outputs" aria-label="Daftar gambar yang diambil">
                </ul>
              </div>
            </div>
  
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>
              <div id="location-more-info">Anda dapat menyertakan lokasi kamu sekarang atau kejadian dalam ceritamu.</div>
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="peta" class="new-form__location__map" aria-label="Peta lokasi kejadian"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <label for="latitudeInput">Latitude</label>
                  <input type="number" step="any" name="latitude" id="latitudeInput" value="-6.352003776761075">
  
                  <label for="longitudeInput">Longitude</label>
                  <input type="number" step="any" name="longitude" id="longitudeInput" value="106.83254971864685">
                </div>
              </div>
            </div>
  
            <div class="form-buttons">
              <button class="btn" type="submit" id="submit-button-container">Buat Cerita</button>
              <a class="btn btn-outline sb-btn" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </main>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAppApi,
    });
    this.#takenStories = [];
    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById("new-form");
    this.#galleryCanvas = document.getElementById("gallery-canvas");

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        description: this.#form.elements.namedItem("description").value,
        latitude: this.#form.elements.namedItem("latitude").value,
        longitude: this.#form.elements.namedItem("longitude").value,
      };

      // Prepare FormData for photos and documentation
      const formData = new FormData();
      formData.set("description", data.description);
      formData.set("lat", data.latitude);
      formData.set("lon", data.longitude);

      // Add taken photos (from file input or camera)
      this.#takenStories.forEach((documentation) => {
        formData.append("photo", documentation.blob);
      });

      const photo = this.#takenStories.find((_, i) => i === 0);

      // Show loading indicator
      this.showSubmitLoadingButton();

      // Send form data to API
      try {
        // const response = await storeNewStory(formData);
        const response = await storeNewStory({
          description: data.description,
          photo: photo?.blob,
          lat: data.latitude,
          lon: data.longitude,
        });

        if (response.ok) {
          this.storeSuccessfully("Cerita berhasil dibuat");
        } else {
          this.storeFailed("Gagal membuat cerita");
        }
      } catch (error) {
        this.storeFailed(`Error: ${error.message}`);
      } finally {
        this.hideSubmitLoadingButton();
      }
    });

    document
      .getElementById("stories-input")
      .addEventListener("change", async (event) => {
        if (event.target.files && event.target.files.length > 0) {
          const insertingPicturesPromises = Array.from(event.target.files).map(
            async (file) => {
              return await this.#processGalleryImage(file);
            }
          );
          await Promise.all(insertingPicturesPromises);
          await this.#populateTakenPictures();
        }
      });

    document
      .getElementById("stories-input-button")
      .addEventListener("click", () => {
        document.getElementById("stories-input").click();
      });

    const cameraContainer = document.getElementById("camera-container");

    document
      .getElementById("open-stories-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.classList.toggle("open");
        this.#isCameraOpen = cameraContainer.classList.contains("open");

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = "Tutup Kamera";
          this.#setupCamera();
          await this.#camera.launch();
          return;
        }

        event.currentTarget.textContent = "Buka Kamera";

        if (this.#camera) {
          await this.#camera.stop();
        }
      });
  }

  // Process gallery images through canvas
  async #processGalleryImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = this.#galleryCanvas;
      const ctx = canvas.getContext("2d");

      img.onload = async () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convert canvas to base64 (similar to camera capture)
        const base64Image = canvas.toDataURL("image/jpeg");

        // Add processed image to taken images
        const newPicture = await this.#addTakenPicture(
          convertBase64ToBlob(base64Image, "image/jpeg")
        );

        resolve(newPicture);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async initialMap(story) {
    if (!this.#map) {
      const lat = story?.lat ?? -6.352052;
      const lon = story?.lon ?? 106.83252;
      this.#map = initializeMap("peta", [lat, lon], 9);

      // Define custom icon
      const customIcon = L.icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add initial marker with custom icon
      this.#marker = L.marker([lat, lon], { icon: customIcon }).addTo(
        this.#map
      );

      // Add click event to map
      this.#map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById("latitudeInput").value = lat;
        document.getElementById("longitudeInput").value = lng;
        this.updateMapLocation();
      });
    }

    document
      .getElementById("latitudeInput")
      .addEventListener("input", () => this.updateMapLocation());

    document
      .getElementById("longitudeInput")
      .addEventListener("input", () => this.updateMapLocation());
  }

  updateMapLocation() {
    if (!this.#map) return;

    const lat = parseFloat(document.getElementById("latitudeInput").value);
    const lon = parseFloat(document.getElementById("longitudeInput").value);

    if (!isNaN(lat) && !isNaN(lon)) {
      // Update map view while maintaining current zoom level
      this.#map.setView([lat, lon], this.#map.getZoom());

      // Update marker position instead of recreating it
      if (this.#marker) {
        this.#marker.setLatLng([lat, lon]);
      } else {
        // Define custom icon if marker doesn't exist
        const customIcon = L.icon({
          iconUrl: markerIcon,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Add new marker with custom icon
        this.#marker = L.marker([lat, lon], { icon: customIcon }).addTo(
          this.#map
        );
      }
    }
  }

  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById("camera-video"),
        cameraSelect: document.getElementById("camera-select"),
        canvas: document.getElementById("camera-canvas"),
      });
    }

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    // Fix: Check if image is a string (base64 from camera)
    if (typeof image === "string") {
      blob = convertBase64ToBlob(image, "image/png");
    }

    const newStory = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };

    this.#takenStories = [...this.#takenStories, newStory];
    return newStory;
  }

  async #populateTakenPictures() {
    if (this.#takenStories.length === 0) {
      document.getElementById("stories-taken-list").innerHTML = "";
      return;
    }

    const html = this.#takenStories.reduce(
      (accumulator, picture, currentIndex) => {
        const imageUrl = URL.createObjectURL(picture.blob);
        return accumulator.concat(`
          <li class="new-form__stories__outputs-item">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
            <button 
              type="button" 
              data-deletepictureid="${picture.id}" 
              class="new-form__stories__outputs-item__delete-btn"
            >
              &times;
        </button>
      </li>
        `);
      },
      ""
    );

    document.getElementById("stories-taken-list").innerHTML = html;

    document
      .querySelectorAll("button[data-deletepictureid]")
      .forEach((button) =>
        button.addEventListener("click", (event) => {
          const pictureId = event.currentTarget.dataset.deletepictureid;
          const deleted = this.#removePicture(pictureId);

          if (!deleted) {
            console.log(`Gambar dengan id ${pictureId} tidak ditemukan`);
          }

          // Update taken pictures
          this.#populateTakenPictures();
        })
      );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenStories.find((picture) => {
      return picture.id === id;
    });

    // Check if selectedPicture was found
    if (!selectedPicture) {
      return null;
    }

    // Remove selected picture from takenPictures
    this.#takenStories = this.#takenStories.filter((picture) => {
      return picture.id !== selectedPicture.id;
    });

    return selectedPicture;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();
    // Redirect page
    location.hash = "/";
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Cerita
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Buat Cerita</button>
    `;
  }
}

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, evidenceImages, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      if (!evidenceImages || evidenceImages.length === 0) {
        throw new Error("Gambar peristiwa (evidenceImages) harus disertakan.");
      }
      if (!description) {
        throw new Error("Deskripsi cerita (description) harus diisi.");
      }
      if (!latitude || !longitude) {
        throw new Error("Lokasi (latitude dan longitude) harus diisi.");
      }

      const data = {
        description,
        photo: evidenceImages[0],
        lat: latitude,
        lon: longitude,
      };

      const response = await this.#model.AddNewStory(data);
      if (!response.ok) {
        console.error("postNewStory: response:", response);
        this.#view.storeFailed(response.message || "Gagal mengirim laporan.");
        return;
      }

      this.#notifyToAllUser(response.data.id);

      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error("postNewStory: error:", error);
      this.#view.storeFailed(
        error.message || "Terjadi kesalahan saat mengirim laporan.",
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async #notifyToAllUser(storyId) {
    try {
      const response =
        await this.#model.sendStoryToAllUserViaNotification(storyId);

      if (!response.ok) {
        console.error("#notifyToAllUser: response:", response);
        return false;
      }

      return true;
    } catch (error) {
      console.error("#notifyToAllUser: error:", error);
      return false;
    }
  }
}

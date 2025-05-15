export default class StoryDetailPresenter {
  #view = null;
  #apiModel = null;
  #storyId = null;
  #storyData = null;
  #dbModel = null;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#view = view;
    this.#apiModel = apiModel;
    this.#storyId = storyId;
    this.#dbModel = dbModel;
  }

  async showStoryDetail() {
    try {
      this.#view.showStoryDetailLoading();

      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.error) {
        this.#storyData = response.story;
        await this.#view.populateStoryDetailAndInitializeMap(
          "Berhasil memuat cerita",
          this.#storyData,
        );
      } else {
        this.#view.populateStoryDetailError(response.message);
        console.error("Gagal memuat detail cerita:", response.message);
        alert("Gagal memuat detail cerita");
      }
    } catch (error) {
      this.#view.populateStoryDetailError(error.message);
      console.error("Terjadi kesalahan:", error);
      alert("Terjadi kesalahan saat memuat detail cerita");
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  // Metode ini tidak lagi diperlukan karena inisialisasi map sudah ditangani di populateStoryDetailAndInitializeMap
  async showStoryDetailMap() {
    // Tidak perlu melakukan apa-apa karena map sudah diinisialisasi
    return;
  }

  async saveStory() {
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);
      const story = response.story; // ambil dari field "story"

      if (!story) {
        throw new Error("Data cerita tidak tersedia.");
      }

      await this.#dbModel.putStory(story);

      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);

      this.#view.removeFromBookmarkSuccessfully(
        "Success to remove from bookmark",
      );
    } catch (error) {
      console.error("removeReport: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }
}

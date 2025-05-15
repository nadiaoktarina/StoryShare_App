export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showBookmarkedStoryMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showBookmarkedStoryMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showBookmarkedStoryMap();

      const stories = await this.#model.getAllStories();

      if (!stories || stories.length === 0) {
        console.warn("initialGalleryAndMap: data kosong");
        this.#view.populateBookmarkedStory(
          "Tidak ada cerita yang disimpan",
          [],
        );
        return;
      }

      this.#view.populateBookmarkedStory("Berhasil memuat bookmark", stories);
    } catch (error) {
      console.error("initialGalleryAndMap: error:", error);
      this.#view.populateBookmarkedStoryError(
        error.message || "An error occurred",
      );
    } finally {
      this.#view.hideLoading();
    }
  }
}

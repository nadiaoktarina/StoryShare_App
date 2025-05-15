export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoriesListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoriesListMap();

      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error("initialGalleryAndMap: error response:", response);
        this.#view.populateStoriesListError(
          response.message || "Failed to fetch stories"
        );
        return;
      }

      // Check if response has the expected structure
      const stories = response.listStory || [];
      const message = response.message || "Success";

      this.#view.populateStoriesList(message, stories);
    } catch (error) {
      console.error("initialGalleryAndMap: error:", error);
      this.#view.populateStoriesListError(error.message || "An error occurred");
    } finally {
      this.#view.hideLoading();
    }
  }
}

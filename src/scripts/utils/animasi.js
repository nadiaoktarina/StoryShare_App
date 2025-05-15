// Tidak pakai import karena pakai CDN
export function animateStoryItems(selector = "story-item") {
  if (!window.gsap) {
    console.error("GSAP belum dimuat. Pastikan CDN GSAP sudah tersedia.");
    return;
  }

  const items = document.querySelectorAll(selector);
  if (!items.length) return;

  gsap.fromTo(
    items,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1, // animasi satu per satu dengan jeda
    }
  );
}

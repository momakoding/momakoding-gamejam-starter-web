document.addEventListener("DOMContentLoaded", () => {
  const SCROLL_LINE = 60;
  const SCROLL_HALF = Math.floor(window.innerHeight / 2);

  function scrollBy(px) {
    window.scrollBy({ top: px, behavior: "smooth" });
  }

  function scrollTo(pos) {
    window.scrollTo({ top: pos, behavior: "smooth" });
  }

  document.addEventListener("keydown", (e) => {
    // Ignore when focus is on an input/textarea
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case "j":
      case "ArrowDown":
        scrollBy(SCROLL_LINE);
        break;
      case "k":
      case "ArrowUp":
        scrollBy(-SCROLL_LINE);
        break;
      case "d":
        scrollBy(SCROLL_HALF);
        break;
      case "u":
        scrollBy(-SCROLL_HALF);
        break;
      case "f":
      case " ":
        if (e.key === " ") e.preventDefault();
        scrollBy(window.innerHeight);
        break;
      case "b":
        scrollBy(-window.innerHeight);
        break;
      case "g":
        scrollTo(0);
        break;
      case "G":
        scrollTo(document.body.scrollHeight);
        break;
      case "ArrowLeft":
        window.open(GITHUB_REPO_URL, "_blank");
        break;
      case "q":
        window.open(GITHUB_REPO_URL, "_blank");
        break;
    }
  });

});
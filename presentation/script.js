const progressBar = document.querySelector(".progress span");
const modeButton = document.querySelector(".mode");
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = Array.from(document.querySelectorAll("main section"));

const updateProgress = () => {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const percent = height > 0 ? (scrollTop / height) * 100 : 0;
  progressBar.style.width = `${percent}%`;
};

const setActiveLink = () => {
  const midpoint = window.innerHeight * 0.4;
  const active = sections.find((section) => {
    const rect = section.getBoundingClientRect();
    return rect.top <= midpoint && rect.bottom >= midpoint;
  });

  navLinks.forEach((link) => link.classList.remove("active"));
  if (active) {
    const match = navLinks.find((link) => link.getAttribute("href") === `#${active.id}`);
    if (match) match.classList.add("active");
  }
};

const toggleContrast = () => {
  document.body.classList.toggle("contrast");
};

window.addEventListener("scroll", () => {
  updateProgress();
  setActiveLink();
});

window.addEventListener("load", () => {
  updateProgress();
  setActiveLink();
});

modeButton.addEventListener("click", toggleContrast);

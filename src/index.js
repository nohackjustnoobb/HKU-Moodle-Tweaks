// Create element out of html string
function fromHTML(html) {
  if (!html) return null;

  // Set up a new template element.
  const template = document.createElement("template");
  template.innerHTML = html;
  const result = template.content.children;

  // Return either an HTMLElement or HTMLCollection
  if (result.length === 1) return result[0];
  return result;
}

// Inject the settings for this application
const menu =
  document.getElementById("action-menu-0-menu") ||
  document.getElementById("carousel-item-main");
if (menu) {
  menu.appendChild(fromHTML("{{divider}}"));

  const item = fromHTML("{{menu}}");
  menu.appendChild(item);

  item.addEventListener("click", toggleSettings);
}

const settings = fromHTML("{{settings}}");
document.body.appendChild(settings);

// attach the event listeners
const bg = settings.getElementsByClassName("background")[0];
bg.addEventListener("click", toggleSettings);

const hideUseless = document.getElementById("hmt-hide-useless-components");
hideUseless.addEventListener("click", toggleUselessComponents);

const hideImg = document.getElementById("hmt-hide-course-images");
hideImg.addEventListener("click", toggleCourseImages);

const randomUITweaks = document.getElementById("hmt-random-ui-tweaks");
randomUITweaks.addEventListener("click", toggleRandomUITweaks);

const coursesFilter = document.getElementById("hmt-courses-filter");
coursesFilter.addEventListener("change", (e) =>
  coursesFilterOnchange(e.target)
);

const darkTheme = document.getElementById("hmt-dark-theme");
darkTheme.addEventListener("click", toggleDarkTheme);

const close = document.getElementById("hmt-close");
close.addEventListener("click", toggleSettings);

// Restore the settings
coursesFilterOnchange();
toggleUselessComponents(false);
toggleCourseImages(false);
toggleRandomUITweaks(false);
toggleDarkTheme(false);

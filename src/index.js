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
const menu = document.getElementById("action-menu-0-menu");
if (menu) {
  menu.appendChild(fromHTML("{{divider}}"));
  menu.appendChild(fromHTML("{{menu}}"));
}
document.body.appendChild(fromHTML("{{settings}}"));

// Restore the settings
coursesFilterOnchange();
toggleUselessComponents(false);
toggleCourseImages(false);

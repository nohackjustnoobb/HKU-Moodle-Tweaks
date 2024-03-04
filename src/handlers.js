// Detect the current page
const pageRegex = {
  homepage: /^https:\/\/moodle\.hku\.hk\/?#?$/,
  courseView: /^https:\/\/moodle\.hku\.hk\/course\/view\.php\?id=.*$/, // currently useless
};

let currPage = null;
for (const [page, regex] of Object.entries(pageRegex))
  if (window.location.href.match(regex)) currPage = page;

function toggleSettings() {
  const element = document.getElementById("hmt-settings");
  if (element) element.classList.toggle("hmt-hide");
}

const calendarOnChange = () => toggleUselessComponents(false);

async function toggleUselessComponents(toggle = true) {
  // Update the checkbox
  let option = (await GM.getValue("hmt-hide-useless-components")) === "1";
  if (toggle) option = !option;
  await GM.setValue("hmt-hide-useless-components", option ? "1" : "0");
  document.getElementById("hmt-hide-useless-components").checked = option;

  const useless = [];

  // Toggle CEDARS info
  const cedars = document.getElementById("inst1256314");
  if (cedars) useless.push(cedars);

  // Toggle Footer
  const footer = document.getElementsByTagName("footer");
  if (footer.length) useless.push(footer[0]);
  const footClass = document.getElementsByClassName("footer");
  if (footClass.length) useless.push(...footClass);

  // Toggle navigation items
  const navigation = document.getElementById("inst4");
  if (navigation) {
    const hometext = navigation.getElementsByClassName("navigation_node");
    if (hometext.length) useless.push(hometext[0]);

    const items = navigation.querySelectorAll("div > div > ul > li > ul > li");
    useless.push(...Array(...items).slice(0, -1));
  }

  // Random empty block
  const emptyBlock = document.getElementById("page-header-nav");
  if (emptyBlock) useless.push(emptyBlock);

  // Random line break
  const lineBreak = document.querySelector("#region-main > div > br");
  if (lineBreak) useless.push(lineBreak);

  // Page specific
  if (currPage) {
    switch (currPage) {
      case "homepage":
        // Toggle navigation
        if (navigation) useless.push(navigation);

        // Toggle search
        const search = document.getElementsByClassName("simplesearchform");
        if (search.length > 0) useless.push(search[0].parentElement);

        // Toggle security info
        const security = document.getElementById("inst477633");
        if (security) useless.push(security);

        // Toggle new event button
        const newEvent = document.querySelector(
          '[data-action="new-event-button"]'
        );
        if (newEvent) useless.push(newEvent);

        // Toggle month text
        const monthText = document.querySelectorAll(
          "div > div > a.arrow_link > span.arrow_text"
        );
        if (monthText.length) useless.push(...monthText);

        // Toggle calendar course selector
        const calendarCourseSelector = document.getElementById(
          "calendar-course-filter-1"
        );
        if (calendarCourseSelector)
          useless.push(calendarCourseSelector.parentElement);

        // Toggle My courses
        const myCourses = document.querySelector("div.paging.paging-morelink");
        if (myCourses) useless.push(myCourses);

        break;
    }
  }

  // apply the settings
  for (const elem of useless) {
    if (option) elem.classList.add("hmt-hide");
    else elem.classList.remove("hmt-hide");
  }

  // Listen for calendar changes
  let calendar = document.getElementsByClassName("maincalendar");
  if (calendar.length) {
    calendar = calendar[0].children[0];
    calendar.removeEventListener("DOMNodeInserted", calendarOnChange);
    calendar.addEventListener("DOMNodeInserted", calendarOnChange);
  }
}

async function toggleCourseImages(toggle = true) {
  // Update the checkbox
  let option = (await GM.getValue("hmt-hide-course-images")) === "1";
  if (toggle) option = !option;
  await GM.setValue("hmt-hide-course-images", option ? "1" : "0");
  document.getElementById("hmt-hide-course-images").checked = option;

  // Get all the course images and apply the settings
  const images = [];
  if (currPage === "homepage") {
    const courseImages = document.getElementsByClassName("courseimage");
    if (courseImages.length) images.push(...courseImages);

    let imgElem = document.querySelector("#frontpage-course-list > div");
    if (imgElem) imgElem = imgElem.getElementsByTagName("img");
    if (imgElem.length) images.push(...imgElem);
  }

  for (const image of images) {
    if (option) image.classList.add("hmt-hide");
    else image.classList.remove("hmt-hide");
  }
}

async function toggleRandomUITweaks(toggle = true) {
  // Update the checkbox
  let option = (await GM.getValue("hmt-random-ui-tweaks")) === "1";
  if (toggle) option = !option;
  await GM.setValue("hmt-random-ui-tweaks", option ? "1" : "0");
  document.getElementById("hmt-random-ui-tweaks").checked = option;

  if (option) document.body.classList.add("hmt-style");
  else document.body.classList.remove("hmt-style");
}

async function coursesFilterOnchange(select) {
  const option = select
    ? select.value
    : (await GM.getValue("hmt-courses-filter")) || "0";
  await GM.setValue("hmt-courses-filter", option);
  document.getElementById("hmt-courses-filter").value = option;

  let filters = [];
  let maxYear = -1,
    maxSem = -1;

  // Extract the course element
  const coursesElem = document.querySelectorAll(
    "#inst476784 > div > div > ul > li > div > a"
  );

  // Extract course info from the element
  const coursesList = [];
  for (const elem of coursesElem) {
    const course = {
      id: /^https:\/\/moodle\.hku\.hk\/course\/view\.php\?id=(.*)$/.exec(
        elem.getAttribute("href")
      )[1],
      title: elem.getAttribute("title"),
    };

    const groups = /^(.*)_(\w{0,3})_(\d{4})$/.exec(course.title);
    if (groups) {
      course["code"] = groups[1];
      course["sem"] = Number(groups[2][0]);
      course["year"] = Number(groups[3]);

      if (course.year >= maxYear) {
        if (course.sem > maxSem) maxSem = course.sem;
        maxYear = course.year;
      }
    }

    coursesList.push(course);
  }

  // Get the filters list from the local storage
  const manualFilters = ((await GM.getValue("hmt-filters")) || "").split("|");

  // Update and hide the courses list
  const list = document.getElementById("hmt-courses-list");
  if (list) {
    list.classList.add("hmt-hide");

    if (!list.innerHTML) {
      const ul = document.createElement("ul");
      for (const course of coursesList) {
        const div = document.createElement("div");
        div.innerText = course.title;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.setAttribute("courseId", course.id);
        checkbox.checked = !manualFilters.find((v) => v === course.id);
        checkbox.addEventListener("change", async (e) => {
          const id = e.target.getAttribute("courseId");
          let manualFilters = ((await GM.getValue("hmt-filters")) || "").split(
            "|"
          );

          if (e.target.checked)
            manualFilters = manualFilters.filter((v) => v !== id);
          else if (!manualFilters.find((v) => v === id)) manualFilters.push(id);

          await GM.setValue("hmt-filters", manualFilters.join("|"));
          coursesFilterOnchange();
        });

        const li = document.createElement("li");
        li.appendChild(div);
        li.appendChild(checkbox);
        ul.appendChild(li);
      }
      list.appendChild(ul);
    } else {
      for (const course of list.getElementsByTagName("input"))
        course.checked = !manualFilters.find(
          (v) => v === course.getAttribute("courseId")
        );
    }
  }

  switch (option) {
    case "1":
      // Filter the courses
      for (const course of coursesList)
        if (course.year < maxYear || course.sem < maxSem) filters.push(course);
      break;
    case "2":
      for (const course of coursesList)
        if (
          !course.year ||
          !course.sem ||
          course.year < maxYear ||
          course.sem < maxSem
        )
          filters.push(course);
      break;
    case "3":
      // show the courses list
      if (list) list.classList.remove("hmt-hide");
      filters = coursesList.filter((v) =>
        manualFilters.find((id) => id === v.id)
      );
      break;
  }

  // Apply the filters
  const mainCoursesList = document.querySelectorAll(
    "#frontpage-course-list > div > div.coursebox"
  );
  for (const course of mainCoursesList) {
    if (filters.find((v) => v.id === course.getAttribute("data-courseid")))
      course.classList.add("hmt-hide");
    else course.classList.remove("hmt-hide");
  }

  const sideCoursesList = document.querySelectorAll(
    "#inst476784 > div > div > ul > li"
  );
  for (const course of sideCoursesList) {
    if (
      filters.find(
        (v) => v.title === course.children[0].children[0].getAttribute("title")
      )
    )
      course.classList.add("hmt-hide");
    else course.classList.remove("hmt-hide");
  }
}

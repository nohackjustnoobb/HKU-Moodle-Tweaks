// ==UserScript==
// @name         HKU Moodle Tweaks
// @version      Dev
// @description  Simple Fix for HKU Moodle
// @author       nohackjustnoobb
// @match        *://moodle.hku.hk/*
// @grant        GM_addElement
// ==/UserScript==

GM_addElement("script", {
  src: "http://localhost:8080/index.js",
  type: "text/javascript",
});

GM_addElement("link", {
  href: "http://localhost:8080/index.css",
  rel: "stylesheet",
});

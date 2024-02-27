import * as fs from "fs";
import escaper from "js-string-escape";
import { minify } from "minify";
import * as path from "path";
import { minify as JSminify } from "terser";

// Store Minified files
let components = {};
let css = "";

// Read and Minify all the components
const directoryPath = "./src/components";
const files = fs.readdirSync(directoryPath);

for (const file of files) {
  const filePath = path.join(directoryPath, file);
  const data = fs.readFileSync(filePath, "utf8");

  // HTML
  if (file.match(/.*\.html/)) {
    const name = /(.*)\.html/.exec(file)[1];
    components[name] = await minify.html(data);
  }

  // CSS
  if (file.match(/.*\.css/)) css += await minify.css(data);
}

// Inject components into index.js
let indexJs = fs.readFileSync("./src/index.js", "utf8");
for (const [key, value] of Object.entries(components))
  indexJs = indexJs.replaceAll(`{{${key}}}`, escaper(value));

// Inject CSS into index.css
let indexCSS = fs.readFileSync("./src/index.css", "utf8");
indexCSS += css;

// Minify index.js and index.css
const minifiedJS =
  (await JSminify(fs.readFileSync("./src/handlers.js", "utf8"))).code +
  (await minify.js(indexJs));
const minifiedCSS = await minify.css(indexCSS);

if (!fs.existsSync("./build")) fs.mkdirSync("./build");
fs.writeFileSync("./build/index.js", minifiedJS);
fs.writeFileSync("./build/index.css", minifiedCSS);
fs.writeFileSync(
  "./build/HKU Moodle Tweaks.user.js",
  `// ==UserScript==
// @name         HKU Moodle Tweaks
// @version      ${process.env.npm_package_version}
// @description  Simple Fix for HKU Moodle
// @author       nohackjustnoobb
// @match        https://moodle.hku.hk/*
// ==/UserScript==

const script = document.createElement("script");
script.innerText = "${escaper(minifiedJS)}";
document.body.appendChild(script)

const style = document.createElement("style");
style.innerText = "${escaper(minifiedCSS)}";
document.body.appendChild(style)
`
);

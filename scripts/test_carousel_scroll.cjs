const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  let braces = 0, opening = source.indexOf('{', start);
  for (let i = opening; i < source.length; i++) {
    if (source[i] === '{') braces++;
    if (source[i] === '}' && --braces === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Missing function ${name}`);
}
const elements = new Map();
for (const id of ['#featured', '#featured-prev', '#featured-next', '#clouds', '#map-lines']) {
  elements.set(id, { children: [], replaceChildren() { this.children = []; }, append(tile) { this.children.push(tile); } });
}
let fullRenders = 0;
const pins = ['one', 'two'].map(id => ({dataset: {responseId: id}, classList: {toggle() {}}, setAttribute(name, value) { this[name] = value; }}));
const context = {
  rows: [{id: 'one'}, {id: 'seed', illustrative: true}, {id: 'two'}],
  featuredOffset: 0, featuredPaused: false, selectedMapResponseId: null,
  $: selector => { assert.notEqual(selector, '#wall', 'Carousel must not touch the response wall'); return elements.get(selector); },
  document: {hidden: false, querySelector: () => null, querySelectorAll: () => pins},
  makeTile: response => response, fitTileText: () => {},
  render: () => { fullRenders++; },
  Math: {floor: Math.floor, random: () => 0.75},
};
vm.createContext(context);
vm.runInContext(['renderFeatured', 'stepFeatured', 'randomFeatured'].map(extract).join('\n'), context);
context.randomFeatured();
assert.equal(context.featuredOffset, 1);
assert.equal(elements.get('#featured').children[0].id, 'two');
assert.equal(pins[1]['aria-pressed'], 'true');
context.stepFeatured(-1);
assert.equal(elements.get('#featured').children[0].id, 'one');
context.featuredPaused = true;
context.randomFeatured();
assert.equal(context.featuredOffset, 0);
assert.equal(fullRenders, 0, 'Automatic and manual carousel changes must not rebuild the wall');
console.log('Carousel updates preserve the response wall and respect pause state.');

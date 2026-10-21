// Exercise the real enhancement script with a small DOM fixture; no browser/network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'guides/guides.js'), 'utf8');
class Element {
  constructor(props = {}) { Object.assign(this, {hidden:false, textContent:'', value:'', dataset:{}, handlers:{}, attrs:{}}, props); }
  addEventListener(type, callback) { this.handlers[type] = callback; }
  setAttribute(name, value) { this.attrs[name] = value; }
  focus() { this.focused = true; }
  fire(type) { this.handlers[type]({preventDefault(){}}); }
}
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'guides/catalog.json'), 'utf8').replace(/^\uFEFF/,''));
const items = catalog.map(row => new Element({dataset:{category:row.category,search:row.title.toLowerCase()}}));
const categories = [...new Set(catalog.map(row => row.category))];
const groups = categories.map(category => {
  const group = new Element();
  group.label = new Element();
  group.querySelectorAll = () => items.filter(item => item.dataset.category === category);
  group.querySelector = () => group.label;
  return group;
});
const buttons = ['all',...categories].map(filter => new Element({dataset:{filter}}));
const elements = Object.fromEntries(['#guide-search','#library-controls','#result-count','#empty-state','#clear-search'].map(id=>[id,new Element()]));
const document = {
  querySelector: id => elements[id] || null,
  querySelectorAll: selector => ({'.guide-item':items,'.guide-group':groups,'[data-filter]':buttons}[selector] || [])
};
vm.runInNewContext(script, {document});
buttons.find(button=>button.dataset.filter==='In the classroom').fire('click');
assert.equal(items.filter(item=>!item.hidden).length,3);
assert.equal(elements['#result-count'].textContent,'3 guides to explore');
elements['#guide-search'].value='zzzz-not-a-topic';
elements['#guide-search'].fire('input');
assert.equal(items.filter(item=>!item.hidden).length,0);
assert.equal(elements['#empty-state'].hidden,false);
elements['#clear-search'].fire('click');
assert.equal(items.filter(item=>!item.hidden).length,20);
assert.equal(buttons[0].attrs['aria-pressed'],'true');
elements['#guide-search'].value='MANDARIN';
elements['#guide-search'].fire('input');
assert.equal(items.filter(item=>!item.hidden).length,1);

const inputs = [4000,2000,18000,3000,5000].map(value => new Element({value:String(value),validity:{valid:true}}));
const form = new Element();
form.querySelectorAll = () => inputs;
const output = new Element(), error = new Element();
const budgetDocument = {querySelector:id=>({'#budget-form':form,'#budget-total':output,'#budget-error':error}[id] || null)};
vm.runInNewContext(script,{document:budgetDocument,setTimeout:callback=>callback()});
assert.equal(output.textContent,'RMB 32,000');
inputs[0].validity.valid=false;
form.fire('input');
assert.equal(output.textContent,'Check amounts');
assert.match(error.textContent,/zero or more/);
inputs.forEach(input=>{input.value='0';input.validity.valid=true;});
form.fire('reset');
assert.equal(output.textContent,'RMB 0');
assert.equal(error.textContent,'');
console.log('PASS: category filtering, empty results, clear/reset, case-insensitive search, budget total, invalid amount and reset.');

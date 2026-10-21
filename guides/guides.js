/* Optional enhancements. All article content and directory links exist in HTML. */
(() => {
  const search = document.querySelector('#guide-search');
  if (search) {
    const controls = document.querySelector('#library-controls');
    const items = [...document.querySelectorAll('.guide-item')];
    const groups = [...document.querySelectorAll('.guide-group')];
    const buttons = [...document.querySelectorAll('[data-filter]')];
    let category = 'all';
    const update = () => {
      const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let visible = 0;
      items.forEach(item => {
        const matches = (category === 'all' || item.dataset.category === category) &&
          words.every(word => item.dataset.search.toLowerCase().includes(word));
        item.hidden = !matches;
        if (matches) visible++;
      });
      groups.forEach(group => {
        const count = [...group.querySelectorAll('.guide-item')].filter(item => !item.hidden).length;
        group.hidden = count === 0;
        group.querySelector('.group-heading span').textContent = `${count} guide${count === 1 ? '' : 's'}`;
      });
      document.querySelector('#result-count').textContent = `${visible} guide${visible === 1 ? '' : 's'} to explore`;
      document.querySelector('#empty-state').hidden = visible !== 0;
    };
    controls.hidden = false;
    search.addEventListener('input', update);
    buttons.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.filter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      update();
    }));
    document.querySelector('#clear-search').addEventListener('click', () => {
      search.value = '';
      category = 'all';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
      update();
      search.focus();
    });
  }
  const budget = document.querySelector('#budget-form');
  if (budget) {
    const inputs = [...budget.querySelectorAll('input')];
    const output = document.querySelector('#budget-total');
    const error = document.querySelector('#budget-error');
    const update = () => {
      const invalid = inputs.some(input => !input.validity.valid);
      error.textContent = invalid ? 'Use whole RMB amounts of zero or more.' : '';
      output.textContent = invalid ? 'Check amounts' : 'RMB ' + inputs.reduce((sum, input) => sum + (Number(input.value) || 0), 0).toLocaleString('en-US');
    };
    budget.addEventListener('input', update);
    budget.addEventListener('submit', event => event.preventDefault());
    budget.addEventListener('reset', () => setTimeout(update, 0));
    update();
  }
})();

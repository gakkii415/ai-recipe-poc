(() => {
  const input = document.querySelector('#recipe-search');
  const clearButton = document.querySelector('#search-clear');
  const rows = [...document.querySelectorAll('.recipe-card')];
  const buttons = [...document.querySelectorAll('[data-category]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  if (!input || !rows.length || !count || !empty) return;

  let category = 'all';
  const normalize = (value) => value.toLocaleLowerCase('ja').normalize('NFKC').trim();

  const apply = () => {
    const query = normalize(input.value);
    let visible = 0;

    rows.forEach((row) => {
      const categoryMatch = category === 'all' || row.dataset.category === category;
      const textMatch = !query || normalize(row.dataset.search || '').includes(query);
      const show = categoryMatch && textMatch;
      row.hidden = !show;
      if (show) visible += 1;
    });

    count.textContent = `${visible}件`;
    empty.hidden = visible !== 0;
    if (clearButton) clearButton.hidden = !input.value;
  };

  input.addEventListener('input', apply);

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      input.value = '';
      input.focus();
      apply();
    });
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.category || 'all';
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      apply();
    });
  });
})();


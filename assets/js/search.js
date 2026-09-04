(() => {
  const input = document.querySelector('#recipe-search');
  const rows = [...document.querySelectorAll('.recipe-row')];
  const buttons = [...document.querySelectorAll('[data-category]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  if (!input || !rows.length) return;

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
  };

  input.addEventListener('input', apply);
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      category = button.dataset.category;
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    });
  });
})();


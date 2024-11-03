const tab_buttons = Array.from(document.querySelectorAll("body>header>button"));
const tab_sections = Array.from(document.querySelectorAll("[tabs]>section"));

const setActiveTab = (i: Number) => {
  tab_buttons.forEach((b, ib) => {
    if (i === ib) {
      b.setAttribute('active', 'active');
    } else {
      b.removeAttribute('active');
    }
  });

  tab_sections.forEach((s, si) => {
    if (i === si) {
      s.removeAttribute('hidden');
    } else {
      s.setAttribute('hidden', 'hidden');
    }
  })
}

tab_buttons.forEach((b, i) => {
  b.addEventListener('click', () => setActiveTab(i))
});
setActiveTab(0);
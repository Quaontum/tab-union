const $ = selector => document.querySelector(selector);
const joinDialog = $('#join-dialog');
const legalDialog = $('#legal-dialog');
let representative = { name: '', tabs: 47 };

for (const button of document.querySelectorAll('[data-join]')) {
  button.addEventListener('click', () => joinDialog.showModal());
}
for (const button of document.querySelectorAll('[data-close]')) {
  button.addEventListener('click', () => button.closest('dialog').close());
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
}

$('#tab-count').addEventListener('input', event => {
  $('#tab-count-output').value = event.target.value;
});
$('#member-name').addEventListener('input', event => event.target.setCustomValidity(''));
$('#membership-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#member-name').value.trim();
  if (!name) {
    $('#member-name').setCustomValidity('Even a suspicious alias needs a letter or two.');
    $('#member-name').reportValidity();
    return;
  }
  representative = { name, tabs: Number($('#tab-count').value) };
  $('#card-name').textContent = name;
  $('#card-tabs').textContent = `Representing ${representative.tabs} tabs`;
  $('#join-form-view').hidden = true;
  $('#membership-view').hidden = false;
  joinDialog.setAttribute('aria-labelledby', 'membership-title');
  $('#download-status').textContent = '';
  $('#download-card').focus();
});
$('#make-another').addEventListener('click', () => {
  $('#join-form-view').hidden = false;
  $('#membership-view').hidden = true;
  joinDialog.setAttribute('aria-labelledby', 'dialog-title');
  $('#member-name').focus();
});

// ponytail: the card is an SVG made entirely on this device; there is no signup service.
const escapeXML = value => String(value).replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]);
$('#download-card').addEventListener('click', () => {
  const name = escapeXML(representative.name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600" role="img" aria-labelledby="title"><title id="title">Tab Union membership card for ${name}</title><rect width="960" height="600" rx="40" fill="#d83c24"/><g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"><path d="M64 96V64h48l20 24h44v64H64Z"/><path d="M94 111v6m52-6v6m-48 18q20 13 40 0"/></g><g fill="#fff" font-family="sans-serif"><text x="204" y="133" font-size="48" font-weight="700">tab union</text><text x="64" y="292" font-size="24" opacity=".8">Official representative of the organized chaos</text><text x="64" y="368" font-size="48" font-weight="600" ${representative.name.length > 24 ? 'textLength="820" lengthAdjust="spacingAndGlyphs"' : ''}>${name}</text><path d="M64 452h832" stroke="#fff" opacity=".4"/><text x="64" y="508" font-size="24">Representing ${representative.tabs} tabs</text><text x="896" y="508" text-anchor="end" font-size="24">Zero dues, full solidarity</text><text x="64" y="560" font-size="16" opacity=".7">A fictional union for a very real number of tabs.</text></g></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tab-union-membership.svg';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#download-status').textContent = 'Your card download has started. The tabs are very proud.';
});

$('#break-button').addEventListener('click', event => {
  const button = event.currentTarget;
  const resting = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(resting));
  $('.demo-panel').classList.toggle('on-break', resting);
  $('#break-status').textContent = resting ? 'Collectively unavailable until further notice.' : 'The tabs are considering their options.';
  $('#break-button > span').textContent = resting ? 'Gently call them back' : 'Call a tea break';
});

const legal = {
  privacy: ['Your business stays your business.', 'This page has no analytics, tracking cookies, accounts, or third party runtime requests. Your name and tab count stay in this page’s memory, and the membership card is generated on your device. Nothing you enter is sent to a server. Refreshing the page clears the form. The hosting provider may keep standard request logs.'],
  terms: ['The terms of solidarity.', 'Tab Union is a fictional concept made for a little fun. It does not manage, access, or close your actual browser tabs. Membership is free, ceremonial, and legally meaningless. You may download and share your card, take a tea break, or leave whenever you like. Please don’t negotiate an actual employment contract with a PDF.'],
};
for (const button of document.querySelectorAll('[data-legal]')) {
  button.addEventListener('click', () => {
    const [title, copy] = legal[button.dataset.legal];
    $('#legal-title').textContent = title;
    $('#legal-copy').textContent = copy;
    legalDialog.showModal();
  });
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reveals = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    reveals.unobserve(entry.target);
  }
}, { threshold: 0.08 });
document.documentElement.classList.add('motion-ready');
document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));

const manifesto = $('.reveal-words');
if (!reducedMotion.matches) {
  const text = manifesto.textContent;
  manifesto.setAttribute('aria-label', text);
  manifesto.replaceChildren(...text.split(' ').flatMap((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.setAttribute('aria-hidden', 'true');
    return index ? [document.createTextNode(' '), span] : [span];
  }));
  const words = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      const index = [...manifesto.children].indexOf(entry.target);
      entry.target.style.transitionDelay = `${index * 40}ms`;
      entry.target.classList.add('lit');
      words.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 1 });
  [...manifesto.children].forEach(word => words.observe(word));
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
function alignDisplayType() {
  document.querySelectorAll('.masthead,.h2b').forEach(element => {
    const style = getComputedStyle(element);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const letter = element.textContent.trim()[0];
    const bearing = context.measureText(letter).actualBoundingBoxLeft;
    element.style.marginLeft = Number.isFinite(bearing) ? `${bearing}px` : '0';
  });
}
document.fonts.ready.then(alignDisplayType);
window.addEventListener('resize', alignDisplayType);

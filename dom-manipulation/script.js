let quotes = [];

const quotesDisplay = document.getElementById('quotesDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const quoteForm = document.getElementById('quoteForm');
const quoteCount = document.getElementById('quoteCount');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importQuotesBtn = document.getElementById('importQuotesBtn');
const importQuotesInput = document.getElementById('importQuotes');

function init() {
  loadQuotes();
  populateCategories();
  restoreFilterPreference();
  filterQuotes();
  setupEventListeners();
  syncWithServer(); // initial sync
  setInterval(syncWithServer, 60000); // sync every 60s
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "work" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
      { text: "Simplicity is the ultimate sophistication.", category: "design" },
      { text: "The best way to predict the future is to invent it.", category: "technology" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterQuotes() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  displayQuotes(filtered);
  saveFilterPreference(selected);
}

function displayQuotes(list) {
  quotesDisplay.innerHTML = '';
  if (list.length === 0) {
    quotesDisplay.innerHTML = '<p>No quotes found in this category.</p>';
    quoteCount.textContent = 'Showing 0 quotes';
    return;
  }
  list.forEach(quote => {
    const container = document.createElement('div');
    container.className = 'quote-container';
    container.innerHTML = `
      <div class="quote-text">"${quote.text}"</div>
      <span class="quote-category">${quote.category}</span>`;
    quotesDisplay.appendChild(container);
  });
  quoteCount.textContent = `Showing ${list.length} ${list.length === 1 ? 'quote' : 'quotes'}`;
}

function saveFilterPreference(cat) {
  localStorage.setItem('lastFilter', cat);
}

function restoreFilterPreference() {
  const last = localStorage.getItem('lastFilter');
  if (last && Array.from(categoryFilter.options).some(o => o.value === last)) {
    categoryFilter.value = last;
  }
}

function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  if (filtered.length === 0) return alert('No quotes in this category!');
  const rand = filtered[Math.floor(Math.random() * filtered.length)];
  displayQuotes([rand]);
  quoteCount.textContent = 'Showing 1 random quote';
}

function addQuote(e) {
  e.preventDefault();
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please fill in both fields');
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();
  e.target.reset();
}

function exportToJsonFile() {
  if (quotes.length === 0) return alert('No quotes to export!');
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      const valid = imported.filter(q => q.text && q.category);
      if (valid.length === 0) throw new Error('No valid quotes found');
      quotes = valid;
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert(`Successfully imported ${valid.length} quotes`);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  };
  reader.onerror = () => alert('Error reading file');
  reader.readAsText(file);
}

function notifyUserOfSync() {
  const bar = document.createElement('div');
  bar.textContent = 'Quotes synced with server.';
  bar.style = 'background: #d1e7dd; color: #0f5132; padding: 10px; margin-top: 10px; border-radius: 4px;';
  document.body.insertBefore(bar, document.body.firstChild);
  setTimeout(() => bar.remove(), 4000);
}

function mergeQuotes(local, server) {
  const seen = new Set();
  const merged = [];
  [...server, ...local].forEach(q => {
    const key = `${q.text.toLowerCase()}|${q.category.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(q);
    }
  });
  return merged;
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    return data.slice(0, 10).map(p => ({
      text: p.title,
      category: p.body.substring(0, 15) || 'general'
    }));
  } catch {
    console.error('Failed to fetch from server');
    return [];
  }
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  const merged = mergeQuotes(localQuotes, serverQuotes);
  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();
  notifyUserOfSync();
}

function setupEventListeners() {
  categoryFilter.addEventListener('change', filterQuotes);
  newQuoteBtn.addEventListener('click', showRandomQuote);
  quoteForm.addEventListener('submit', addQuote);
  exportQuotesBtn.addEventListener('click', exportToJsonFile);
  importQuotesBtn.addEventListener('click', () => importQuotesInput.click());
  importQuotesInput.addEventListener('change', importFromJsonFile);
}

document.addEventListener('DOMContentLoaded', init);

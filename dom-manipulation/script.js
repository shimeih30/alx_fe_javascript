let quotes = [];

const quotesDisplay = document.getElementById('quotesDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const quoteForm = document.getElementById('quoteForm');
const quoteCount = document.getElementById('quoteCount');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importQuotesBtn = document.getElementById('importQuotesBtn');
const importQuotesInput = document.getElementById('importQuotes');

// Initialize application
function init() {
  loadQuotes();
  populateCategories();
  restoreFilterPreference();
  filterQuotes();
  setupEventListeners();
  syncQuotes(); // Initial sync: POST local, then fetch server
  setInterval(syncQuotes, 60000); // Repeat sync every 60 seconds
}

// Load from localStorage or default
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

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown
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

// Filter quotes based on selected category
function filterQuotes() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  displayQuotes(filtered);
  saveFilterPreference(selected);
}

// Display quotes on UI
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

// Save selected filter category
function saveFilterPreference(cat) {
  localStorage.setItem('lastFilter', cat);
}

// Restore filter from localStorage
function restoreFilterPreference() {
  const last = localStorage.getItem('lastFilter');
  if (last && Array.from(categoryFilter.options).some(o => o.value === last)) {
    categoryFilter.value = last;
  }
}

// Show a random quote from filtered list
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  if (filtered.length === 0) return alert('No quotes in this category!');
  const rand = filtered[Math.floor(Math.random() * filtered.length)];
  displayQuotes([rand]);
  quoteCount.textContent = 'Showing 1 random quote';
}

// Add new quote from form
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

// Export quotes to JSON file
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

// Import quotes from JSON file
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

// Notify user visually of data updates
function notifyUser(message) {
  const bar = document.createElement('div');
  bar.textContent = message;
  bar.style = `
    position: fixed;
    top: 10px; left: 50%;
    transform: translateX(-50%);
    background: #0d6efd;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: bold;
  `;
  document.body.appendChild(bar);
  setTimeout(() => bar.remove(), 4000);
}

// Merge server and local quotes, server takes precedence
function mergeQuotes(local, server) {
  const map = new Map();

  // Add server quotes first (take precedence)
  server.forEach(q => {
    const key = `${q.text.toLowerCase()}|${q.category.toLowerCase()}`;
    map.set(key, q);
  });

  // Add local quotes only if not in server
  local.forEach(q => {
    const key = `${q.text.toLowerCase()}|${q.category.toLowerCase()}`;
    if (!map.has(key)) map.set(key, q);
  });

  return Array.from(map.values());
}

// Fetch quotes from mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    // Map posts to quote objects (title = text, body substring = category)
    return data.slice(0, 10).map(p => ({
      text: p.title,
      category: p.body.substring(0, 15) || 'general'
    }));
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

// POST local quotes to mock server
async function postQuotesToServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    if (!res.ok) throw new Error(`POST failed: ${res.status}`);
    const data = await res.json();
    console.log('Posted quotes to server:', data);
  } catch (err) {
    console.error('POST error:', err);
  }
}

// Main sync function: POST local, then fetch & merge server data
async function syncQuotes() {
  try {
    await postQuotesToServer(); // send local quotes first
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);

    // Detect conflicts (differences)
    const conflictCount = mergedQuotes.length - localQuotes.length;
    if (conflictCount > 0) {
      notifyUser(`Quotes updated from server (${conflictCount} new). Conflicts resolved.`);
    } else {
      notifyUser('Quotes synced with server.');
    }

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (err) {
    console.error('Sync error:', err);
    notifyUser('Sync failed. Check console for details.');
  }
}

// Setup event listeners
function setupEventListeners() {
  categoryFilter.addEventListener('change', filterQuotes);
  newQuoteBtn.addEventListener('click', showRandomQuote);
  quoteForm.addEventListener('submit', addQuote);
  exportQuotesBtn.addEventListener('click', exportToJsonFile);
  importQuotesBtn.addEventListener('click', () => importQuotesInput.click());
  importQuotesInput.addEventListener('change', importFromJsonFile);
}

document.addEventListener('DOMContentLoaded', init);

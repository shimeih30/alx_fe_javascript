// Main quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quotesDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');
const quoteForm = document.getElementById('quoteForm');
const quoteCount = document.getElementById('quoteCount');
const exportQuotesBtn = document.getElementById('exportQuotes');
const importQuotesBtn = document.getElementById('importQuotesBtn');
const importQuotesInput = document.getElementById('importQuotes');

// Initialize the application
function init() {
  loadQuotes();
  populateCategories();
  restoreFilterPreference();
  filterQuote();
  setupEventListeners();
}

// Load quotes from localStorage
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

// Populate categories dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

// Filter quotes by category
function filterQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);
  displayQuotes(filtered);
  saveFilterPreference(selected);
}

// Display quotes
function displayQuotes(quotesToDisplay) {
  quoteDisplay.innerHTML = '';
  if (quotesToDisplay.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes found in this category.</p>';
    quoteCount.textContent = 'Showing 0 quotes';
    return;
  }
  quotesToDisplay.forEach(quote => {
    const quoteEl = document.createElement('div');
    quoteEl.className = 'quote-container';
    quoteEl.innerHTML = `
      <div class="quote-text">"${quote.text}"</div>
      <span class="quote-category">${quote.category}</span>
    `;
    quoteDisplay.appendChild(quoteEl);
  });
  quoteCount.textContent = `Showing ${quotesToDisplay.length} ${quotesToDisplay.length === 1 ? 'quote' : 'quotes'}`;
}

// Save filter to storage
function saveFilterPreference(category) {
  localStorage.setItem('lastFilter', category);
}

// Restore filter from storage
function restoreFilterPreference() {
  const last = localStorage.getItem('lastFilter');
  if (last && Array.from(categoryFilter.options).some(o => o.value === last)) {
    categoryFilter.value = last;
    filterQuote();
  }
}

// Show random quote
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    alert('No quotes available in this category!');
    return;
  }

  const rand = Math.floor(Math.random() * filtered.length);
  const quote = filtered[rand];

  quoteDisplay.innerHTML = `
    <div class="quote-container">
      <div class="quote-text">"${quote.text}"</div>
      <span class="quote-category">${quote.category}</span>
    </div>
  `;
  quoteCount.textContent = 'Showing 1 random quote';
}

// Add new quote
function addQuote(e) {
  e.preventDefault();
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }
  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  if (categoryFilter.value === 'all' || categoryFilter.value === category) {
    filterQuote();
  }
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// Export to JSON
function exportToJsonFile() {
  if (quotes.length === 0) {
    alert('No quotes available to export!');
    return;
  }
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quotes-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      const valid = imported.filter(q =>
        q &&
        typeof q.text === 'string' &&
        typeof q.category === 'string' &&
        q.text.trim() !== '' &&
        q.category.trim() !== ''
      );
      if (valid.length === 0) throw new Error('No valid quotes found');
      quotes = valid;
      saveQuotes();
      populateCategories();
      filterQuote();
      alert(`Imported ${valid.length} quotes successfully!`);
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }
    e.target.value = '';
  };
  reader.onerror = () => {
    alert('Error reading file');
    e.target.value = '';
  };
  reader.readAsText(file);
}

// Event listeners
function setupEventListeners() {
  categoryFilter.addEventListener('change', filterQuote);
  newQuoteBtn.addEventListener('click', showRandomQuote);
  quoteForm.addEventListener('submit', addQuote);
  exportQuotesBtn.addEventListener('click', exportToJsonFile);
  importQuotesBtn.addEventListener('click', () => importQuotesInput.click());
  importQuotesInput.addEventListener('change', importFromJsonFile);
}

// Launch app
document.addEventListener('DOMContentLoaded', init);
function filterQuote() {
  const selectedCategory = categoryFilter.value; // Use this exact variable name
  let filteredQuotes;

  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  displayQuotes(filteredQuotes);
  saveFilterPreference(selectedCategory); // Save it to localStorage
}

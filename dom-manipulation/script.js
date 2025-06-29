// Main quotes array
let quotes = [];

// DOM elements
const quotesDisplay = document.getElementById('quotesDisplay');
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
  filterQuotes();
  setupEventListeners();
  restoreFilterPreference();
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    console.log('Quotes loaded from localStorage:', quotes.length);
  } else {
    // Default quotes if none exist
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
  console.log('Quotes saved to localStorage');
}

// Populate categories dropdown
function populateCategories() {
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options (keeping "All" option)
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add categories to dropdown
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes;
  
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  displayQuotes(filteredQuotes);
  saveFilterPreference(selectedCategory);
}

// Display quotes in the UI
function displayQuotes(quotesToDisplay) {
  quotesDisplay.innerHTML = '';
  
  if (quotesToDisplay.length === 0) {
    quotesDisplay.innerHTML = '<p>No quotes found in this category.</p>';
    quoteCount.textContent = 'Showing 0 quotes';
    return;
  }
  
  quotesToDisplay.forEach(quote => {
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote-container';
    quoteElement.innerHTML = `
      <div class="quote-text">"${quote.text}"</div>
      <span class="quote-category">${quote.category}</span>
    `;
    quotesDisplay.appendChild(quoteElement);
  });
  
  quoteCount.textContent = `Showing ${quotesToDisplay.length} ${quotesToDisplay.length === 1 ? 'quote' : 'quotes'}`;
}

// Save filter preference to localStorage
function saveFilterPreference(category) {
  localStorage.setItem('lastFilter', category);
}

// Restore filter preference from localStorage
function restoreFilterPreference() {
  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter && Array.from(categoryFilter.options).some(opt => opt.value === lastFilter)) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// Show random quote from current filter
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes;
  
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  if (filteredQuotes.length === 0) {
    alert('No quotes available in this category!');
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  quotesDisplay.innerHTML = `
    <div class="quote-container">
      <div class="quote-text">"${randomQuote.text}"</div>
      <span class="quote-category">${randomQuote.category}</span>
    </div>
  `;
  
  quoteCount.textContent = 'Showing 1 random quote';
}

// Add new quote
function addQuote(event) {
  event.preventDefault();
  
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }
  
  const newQuote = { text, category };
  quotes.push(newQuote);
  
  // Save and update UI
  saveQuotes();
  populateCategories();
  
  // If the new quote's category matches current filter or "All" is selected, show it
  if (categoryFilter.value === 'all' || categoryFilter.value === category) {
    filterQuotes();
  }
  
  // Clear form
  textInput.value = '';
  categoryInput.value = '';
  
  // Focus on text input for next entry
  textInput.focus();
  
  console.log('New quote added:', newQuote);
}

// Export quotes to JSON file
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
  a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote object
      const validQuotes = importedQuotes.filter(quote => 
        quote && 
        typeof quote.text === 'string' && 
        typeof quote.category === 'string' &&
        quote.text.trim() !== '' &&
        quote.category.trim() !== ''
      );
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file');
      }
      
      quotes = validQuotes;
      saveQuotes();
      populateCategories();
      filterQuotes();
      
      alert(`Successfully imported ${validQuotes.length} quotes!`);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}`);
    }
    
    // Reset input
    event.target.value = '';
  };
  
  reader.onerror = function() {
    alert('Error reading file');
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

// Set up event listeners
function setupEventListeners() {
  categoryFilter.addEventListener('change', filterQuotes);
  newQuoteBtn.addEventListener('click', showRandomQuote);
  quoteForm.addEventListener('submit', addQuote);
  exportQuotesBtn.addEventListener('click', exportToJsonFile);
  importQuotesBtn.addEventListener('click', () => importQuotesInput.click());
  importQuotesInput.addEventListener('change', importFromJsonFile);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
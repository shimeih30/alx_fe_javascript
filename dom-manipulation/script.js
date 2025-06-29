// Quotes array - will be loaded from localStorage
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const quoteForm = document.getElementById('quoteForm');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const storageInfo = document.getElementById('storageInfo');

// Initialize the application
function init() {
  // Load quotes from localStorage
  loadQuotes();
  
  // Display first quote
  showRandomQuote();
  
  // Set up category filter dropdown
  updateCategoryFilter();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  quoteForm.addEventListener('submit', handleFormSubmit);
  exportBtn.addEventListener('click', exportToJson);
  importBtn.addEventListener('click', triggerImport);
  importFile.addEventListener('change', importFromJsonFile);
  
  // Display storage info
  updateStorageInfo();
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
    console.log('Quotes loaded from localStorage:', quotes);
  } else {
    // Load default quotes if none in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "work" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "In the middle of difficulty lies opportunity.", category: "inspiration" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
  console.log('Quotes saved to localStorage');
  updateStorageInfo();
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  addQuote();
}

// Add a new quote
function addQuote() {
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
  
  // Clear form
  textInput.value = '';
  categoryInput.value = '';
  
  // Update storage and UI
  saveQuotes();
  updateCategoryFilter();
  showRandomQuote();
  
  // Store last added quote in sessionStorage
  sessionStorage.setItem('lastAddedQuote', JSON.stringify(newQuote));
}

// Display a random quote
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  
  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available in this category.</p>';
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <blockquote>${quote.text}</blockquote>
    <p class="category">Category: ${quote.category}</p>
  `;
  
  // Store last viewed quote in sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Get filtered quotes based on current category selection
function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  return selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const currentSelection = categoryFilter.value;
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  if (categories.includes(currentSelection)) {
    categoryFilter.value = currentSelection;
  }
}

// Export quotes to JSON file
function exportToJson() {
  if (quotes.length === 0) {
    alert('No quotes to export!');
    return;
  }
  
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quotes.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Store last export time in sessionStorage
  sessionStorage.setItem('lastExportTime', new Date().toISOString());
  updateStorageInfo();
}

// Trigger file input for import
function triggerImport() {
  importFile.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileReader = new FileReader();
  
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedQuotes)) {
        throw new Error('Invalid format: Expected an array of quotes');
      }
      
      // Validate each quote
      const validQuotes = importedQuotes.filter(quote => 
        quote.text && quote.category && 
        typeof quote.text === 'string' && 
        typeof quote.category === 'string'
      );
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file');
      }
      
      quotes.push(...validQuotes);
      saveQuotes();
      updateCategoryFilter();
      showRandomQuote();
      
      alert(`Successfully imported ${validQuotes.length} quotes!`);
      
      // Store import info in sessionStorage
      sessionStorage.setItem('lastImportTime', new Date().toISOString());
      sessionStorage.setItem('lastImportCount', validQuotes.length);
      updateStorageInfo();
      
    } catch (error) {
      console.error('Error importing quotes:', error);
      alert(`Error importing quotes: ${error.message}`);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  fileReader.onerror = function() {
    alert('Error reading file');
    event.target.value = '';
  };
  
  fileReader.readAsText(file);
}

// Update storage information display
function updateStorageInfo() {
  const quoteCount = quotes.length;
  const lastExportTime = sessionStorage.getItem('lastExportTime');
  const lastImportTime = sessionStorage.getItem('lastImportTime');
  const lastImportCount = sessionStorage.getItem('lastImportCount');
  
  let infoHTML = `<p>Stored Quotes: ${quoteCount}</p>`;
  
  if (lastExportTime) {
    infoHTML += `<p>Last exported: ${new Date(lastExportTime).toLocaleString()}</p>`;
  }
  
  if (lastImportTime && lastImportCount) {
    infoHTML += `<p>Last imported: ${new Date(lastImportTime).toLocaleString()} (${lastImportCount} quotes)</p>`;
  }
  
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    const quote = JSON.parse(lastViewedQuote);
    infoHTML += `<p>Last viewed: "${quote.text}" (${quote.category})</p>`;
  }
  
  storageInfo.innerHTML = infoHTML;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  categoryFilter.addEventListener('change', () => {
    showRandomQuote();
  });
});
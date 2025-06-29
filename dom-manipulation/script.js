// Initial quotes data
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "work" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "design" },
  { text: "The best way to predict the future is to invent it.", category: "technology" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize the application
function init() {
  // Display first quote
  showRandomQuote();
  
  // Set up category filter dropdown
  updateCategoryFilter();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
  addQuoteBtn.addEventListener('click', addQuote);
  categoryFilter.addEventListener('change', filterByCategory);
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
  
  const quoteElement = document.createElement('div');
  quoteElement.innerHTML = `
    <blockquote>${quote.text}</blockquote>
    <p class="category">Category: ${quote.category}</p>
  `;
  
  quoteDisplay.innerHTML = '';
  quoteDisplay.appendChild(quoteElement);
}

// Get quotes filtered by current category selection
function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

// Add a new quote
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();
  
  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }
  
  const newQuote = { text, category };
  quotes.push(newQuote);
  
  // Clear input fields
  newQuoteText.value = '';
  newQuoteCategory.value = '';
  
  // Update UI
  updateCategoryFilter();
  showRandomQuote();
  
  console.log('New quote added:', newQuote);
}

// Update category filter dropdown
function updateCategoryFilter() {
  // Get all unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Save current selection
  const currentSelection = categoryFilter.value;
  
  // Clear and rebuild options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (categories.includes(currentSelection)) {
    categoryFilter.value = currentSelection;
  }
}

// Filter quotes by category
function filterByCategory() {
  showRandomQuote();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
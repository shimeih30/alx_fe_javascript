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
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize the application
function init() {
  // Create and display the "Add Quote" form
  createAddQuoteForm();
  
  // Display first quote
  showRandomQuote();
  
  // Set up category filter dropdown
  updateCategoryFilter();
  
  // Event listeners
  newQuoteBtn.addEventListener('click', showRandomQuote);
}

// Create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.querySelector('.add-quote-form');
  formContainer.innerHTML = '';
  
  const form = document.createElement('form');
  form.id = 'quoteForm';
  
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.id = 'newQuoteText';
  textInput.placeholder = 'Enter a new quote';
  textInput.required = true;
  
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';
  categoryInput.required = true;
  
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Add Quote';
  
  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);
  formContainer.appendChild(form);
  
  // Add form submit handler
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    addQuote();
  });
}

// Add a new quote to the array and update DOM
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
  
  // Update UI
  updateCategoryFilter();
  showRandomQuote();
  
  console.log('New quote added:', newQuote);
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

// Filter quotes by category
function filterByCategory() {
  showRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  categoryFilter.addEventListener('change', filterByCategory);
});
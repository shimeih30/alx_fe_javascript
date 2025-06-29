// Initial set of quotes
let quotes = [
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Creativity is intelligence having fun.", category: "Creativity" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Show random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote and the category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added successfully!");
}

// Event listener
newQuoteBtn.addEventListener("click", showRandomQuote);

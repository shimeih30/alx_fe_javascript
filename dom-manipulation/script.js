// Previous code remains the same until the export/import functions

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
  a.download = 'quotes-export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Handle import quotes button click
document.getElementById('importQuotesBtn').addEventListener('click', function() {
  document.getElementById('importQuotes').click();
});

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
        typeof quote.category === 'string'
      );
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in the file');
      }
      
      quotes = validQuotes; // Replace existing quotes
      saveQuotes();
      updateCategoryFilter();
      showRandomQuote();
      
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

// Initialize event listeners
function init() {
  // Previous initialization code
  
  // Add these new event listeners
  document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
  document.getElementById('importQuotes').addEventListener('change', importFromJsonFile);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
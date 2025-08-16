// Simple replacement for Flatpickr functionality
// This provides a minimal date picker using HTML5 date input with validation

function flatpickr(element, options = {}) {
  // Convert text input to date input for better browser support
  element.type = 'date';
  
  // Set minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  element.min = today;
  
  // Set maximum date (90 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  element.max = maxDate.toISOString().split('T')[0];
  
  // Add change event listener
  if (options.onChange) {
    element.addEventListener('change', function() {
      const value = this.value;
      options.onChange(value ? [new Date(value)] : [], value);
    });
  }
  
  // Call onReady if provided
  if (options.onReady) {
    setTimeout(() => options.onReady([], '', { calendarContainer: element }), 0);
  }
  
  return {
    element: element,
    clear: function() {
      element.value = '';
      if (options.onChange) {
        options.onChange([], '');
      }
    }
  };
}

// Make it globally available
window.flatpickr = flatpickr;
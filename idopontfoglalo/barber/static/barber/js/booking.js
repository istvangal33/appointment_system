// ====================================
// ENHANCED BOOKING SYSTEM FOR HARMÓNIA MASSZÁZS SZALON
// ====================================

document.addEventListener("DOMContentLoaded", function () {
  const business = document.getElementById("business").value;
  const bookingForm = document.getElementById("bookingForm");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const selectedDateTime = document.getElementById("selectedDateTime");
  const dateTimeSummary = document.getElementById("dateTimeSummary");

  console.log('Booking system initialization started');
  console.log('Business slug:', business);

  // Initialize Flatpickr for date selection (with fallback)
  let datePicker = null;
  if (typeof flatpickr !== 'undefined') {
    datePicker = flatpickr(dateInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    maxDate: new Date().fp_incr(90), // Allow booking up to 90 days ahead
    locale: {
      firstDayOfWeek: 1, // Monday
      weekdays: {
        shorthand: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
        longhand: ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
      },
      months: {
        shorthand: ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
        longhand: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December']
      }
    },
    disable: [
      // Disable Sundays (day 0)
      function(date) {
        return (date.getDay() === 0);
      }
    ],
    onChange: function (selectedDates, dateStr) {
      if (dateStr) {
        fetchAvailableTimes(business, dateStr);
        updateSummary();
      } else {
        resetTimeSelect();
        hideSummary();
      }
    },
    onReady: function(selectedDates, dateStr, instance) {
      // Add some styling to the calendar
      instance.calendarContainer.classList.add('flatpickr-custom');
    }
  });
  console.log('Flatpickr initialized successfully');
  } else {
    console.warn('Flatpickr not available, using fallback date input');
    // Fallback: use regular date input with manual change handler
    dateInput.type = 'date';
    dateInput.addEventListener('change', function() {
      const dateStr = this.value;
      if (dateStr) {
        fetchAvailableTimes(business, dateStr);
        updateSummary();
      } else {
        resetTimeSelect();
        hideSummary();
      }
    });
  }

  function fetchAvailableTimes(business, date) {
    const timeSelect = document.getElementById('time');
    if (!timeSelect) {
      console.error('Time select element not found');
      return;
    }
    
    console.log('Fetching available times for:', { business, date });
    
    // Show loading state
    timeSelect.innerHTML = '<option value="">Időpontok betöltése...</option>';
    timeSelect.disabled = true;

    const url = `/barber/api/available-times/?business=${encodeURIComponent(business)}&date=${encodeURIComponent(date)}`;
    console.log('API URL:', url);

    fetch(url, { 
      headers: { 'Accept': 'application/json' },
      method: 'GET'
    })
      .then(response => {
        console.log('API Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API Response data:', data);
        
        // Clear loading state
        timeSelect.innerHTML = '<option value="">Válasszon időpontot</option>';

        if (data.error) {
          console.error('API Error:', data.error);
          timeSelect.innerHTML = '<option value="">Hiba történt az időpontok betöltésekor</option>';
          timeSelect.disabled = false;
          return;
        }

        if (data.times && data.times.length > 0) {
          console.log(`Found ${data.times.length} available times:`, data.times);
          data.times.forEach(time => {
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
          });
          timeSelect.disabled = false;
        } else {
          console.log('No available times found');
          timeSelect.innerHTML = '<option value="">Nincs szabad időpont ezen a napon</option>';
          timeSelect.disabled = false;
        }
      })
      .catch(error => {
        console.error('Fetch Error:', error);
        timeSelect.innerHTML = '<option value="">Hiba történt az időpontok betöltésekor</option>';
        timeSelect.disabled = false;
      });
  }

  // Reset time select
  function resetTimeSelect() {
    timeSelect.innerHTML = '<option value="">Először válassza ki a dátumot</option>';
    timeSelect.disabled = true;
  }

  // Update booking summary
  function updateSummary() {
    const dateValue = dateInput.value;
    const timeValue = timeSelect.value;
    
    if (dateValue && timeValue) {
      const formattedDate = formatDate(dateValue);
      selectedDateTime.textContent = `${formattedDate}, ${timeValue}`;
      dateTimeSummary.style.display = 'block';
    } else if (dateValue) {
      selectedDateTime.textContent = `${formatDate(dateValue)} - válasszon időpontot`;
      dateTimeSummary.style.display = 'block';
    } else {
      hideSummary();
    }
  }

  // Hide summary
  function hideSummary() {
    dateTimeSummary.style.display = 'none';
  }

  // Format date for display
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const months = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
    
    return `${date.getFullYear()}. ${months[date.getMonth()]} ${date.getDate()}. (${days[date.getDay()]})`;
  }

  // Time select change handler
  timeSelect.addEventListener('change', updateSummary);

  // Enhanced form validation
  function validateForm() {
    const requiredFields = ['date', 'time', 'name', 'phone', 'email'];
    let isValid = true;
    let firstInvalidField = null;

    // Clear previous validation states
    document.querySelectorAll('.is-invalid').forEach(field => {
      field.classList.remove('is-invalid');
    });

    requiredFields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      const value = field.value.trim();
      
      if (!value) {
        field.classList.add('is-invalid');
        if (!firstInvalidField) firstInvalidField = field;
        isValid = false;
      }
    });

    // Email validation
    const emailField = document.getElementById('email');
    const emailValue = emailField.value.trim();
    if (emailValue && !isValidEmail(emailValue)) {
      emailField.classList.add('is-invalid');
      if (!firstInvalidField) firstInvalidField = emailField;
      isValid = false;
    }

    // Phone validation
    const phoneField = document.getElementById('phone');
    const phoneValue = phoneField.value.trim();
    if (phoneValue && !isValidPhone(phoneValue)) {
      phoneField.classList.add('is-invalid');
      if (!firstInvalidField) firstInvalidField = phoneField;
      isValid = false;
    }

    // Terms checkbox validation
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
      termsCheckbox.classList.add('is-invalid');
      if (!firstInvalidField) firstInvalidField = termsCheckbox;
      isValid = false;
    }

    // Focus on first invalid field
    if (firstInvalidField) {
      firstInvalidField.focus();
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  // Email validation
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation (Hungarian phone numbers)
  function isValidPhone(phone) {
    const phoneRegex = /^(\+36|06)[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('36')) {
      value = '+36 ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
    } else if (value.startsWith('06')) {
      value = '+36 ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
    } else if (value.length > 0 && !value.startsWith('36')) {
      value = '+36 ' + value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 9);
    }
    
    e.target.value = value;
  });

  // Form submission
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      // Show validation error message
      showNotification('Kérjük töltse ki az összes kötelező mezőt megfelelően!', 'error');
      return;
    }

    // Collect form data
    const formData = {
      business: business,
      service_type: document.getElementById("service_type").value || "massage",
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      newsletter: document.getElementById("newsletter").checked
    };

    // Show loading state
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Foglalás küldése...';
    submitBtn.disabled = true;

    // Submit booking
    fetch('/barber/api/book-appointment/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(response => {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      if (response.status === 'success') {
        showSuccessModal(formData);
        bookingForm.reset();
        resetTimeSelect();
        hideSummary();
        if (datePicker && datePicker.clear) {
          datePicker.clear();
        } else {
          dateInput.value = '';
        }
      } else {
        showNotification(response.message || 'Hiba történt a foglalás során. Kérjük próbálja újra!', 'error');
      }
    })
    .catch(error => {
      console.error('Booking error:', error);
      
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      showNotification('Hiba történt a foglalás során. Kérjük próbálja újra!', 'error');
    });
  });

  // Show success modal
  function showSuccessModal(bookingData) {
    const successModalElement = document.getElementById('successModal');
    const bookingDetails = document.getElementById('bookingDetails');
    
    // Update booking details
    bookingDetails.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Név:</span>
        <span class="detail-value">${bookingData.name}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Dátum:</span>
        <span class="detail-value">${formatDate(bookingData.date)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Időpont:</span>
        <span class="detail-value">${bookingData.time}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Telefon:</span>
        <span class="detail-value">${bookingData.phone}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${bookingData.email}</span>
      </div>
    `;
    
    // Show modal using fallback method for better compatibility
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      // Use Bootstrap modal if available
      const modal = new bootstrap.Modal(successModalElement);
      modal.show();
    } else {
      // Fallback: show modal manually
      successModalElement.style.display = 'block';
      successModalElement.classList.add('show');
      successModalElement.style.paddingRight = '17px';
      document.body.classList.add('modal-open');
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = 'modal-backdrop-manual';
      document.body.appendChild(backdrop);
    }
  }

  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} notification-toast`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Get CSRF token
  function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .flatpickr-custom {
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(139, 115, 85, 0.1);
    }
    
    .flatpickr-custom .flatpickr-day.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .flatpickr-custom .flatpickr-day:hover {
      background: var(--beige);
    }
    
    .is-invalid {
      border-color: #dc3545 !important;
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  // Real-time validation
  const formFields = bookingForm.querySelectorAll('input, select');
  formFields.forEach(field => {
    field.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        this.classList.add('is-invalid');
      } else {
        this.classList.remove('is-invalid');
      }
      
      // Specific validations
      if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
        this.classList.add('is-invalid');
      } else if (this.type === 'tel' && this.value && !isValidPhone(this.value)) {
        this.classList.add('is-invalid');
      }
    });
    
    field.addEventListener('input', function() {
      if (this.classList.contains('is-invalid') && this.value.trim()) {
        this.classList.remove('is-invalid');
      }
    });
  });

  // Handle modal close buttons when Bootstrap is not available
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-bs-dismiss="modal"]')) {
      const modalElement = e.target.closest('.modal');
      if (modalElement) {
        closeModal(modalElement);
      }
    }
  });

  // Function to close modal manually
  function closeModal(modalElement) {
    modalElement.style.display = 'none';
    modalElement.classList.remove('show');
    modalElement.style.paddingRight = '';
    document.body.classList.remove('modal-open');
    
    // Remove manual backdrop
    const backdrop = document.getElementById('modal-backdrop-manual');
    if (backdrop) {
      backdrop.remove();
    }
  }

  console.log('Enhanced booking system initialized for Harmónia Masszázs Szalon');
});

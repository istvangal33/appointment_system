// ====================================
// CONTACT FORM HANDLING
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                privacy: formData.get('privacy')
            };
            
            // Validate required fields
            if (!data.name || !data.email || !data.message || !data.privacy) {
                showMessage('Kérjük töltse ki az összes kötelező mezőt!', 'danger');
                return;
            }
            
            // Validate email format
            if (!isValidEmail(data.email)) {
                showMessage('Kérjük adjon meg egy érvényes email címet!', 'danger');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Küldés...';
            submitBtn.disabled = true;
            
            // Simulate form submission (in real implementation, this would be an API call)
            setTimeout(() => {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Show success message
                showMessage('Köszönjük üzenetét! 24 órán belül válaszolunk Önnek.', 'success');
                
                // Reset form
                contactForm.reset();
                
                // Log for demonstration (in real app, this would be sent to server)
                console.log('Contact form submitted:', data);
                
                // Scroll to message
                if (formMessage) {
                    formMessage.scrollIntoView({ behavior: 'smooth' });
                }
                
            }, 2000);
        });
    }
    
    // Show message function
    function showMessage(message, type) {
        if (!formMessage) return;
        
        formMessage.className = `alert alert-${type}`;
        formMessage.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
        `;
        formMessage.classList.remove('d-none');
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                formMessage.classList.add('d-none');
            }, 5000);
        }
    }
    
    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Form field enhancements
    const formInputs = contactForm ? contactForm.querySelectorAll('input, textarea, select') : [];
    
    formInputs.forEach(input => {
        // Add floating label effect
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation
        if (input.type === 'email') {
            input.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
        
        if (input.hasAttribute('required')) {
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Format as +36 XX XXX XXXX
            if (value.startsWith('36')) {
                value = '+36 ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
            } else if (value.startsWith('06')) {
                value = '+36 ' + value.slice(2, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
            } else if (value.length > 0) {
                value = '+36 ' + value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5, 9);
            }
            
            e.target.value = value;
        });
    }
    
    // Character counter for message textarea
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        const maxLength = 500;
        const counter = document.createElement('small');
        counter.className = 'text-muted';
        counter.style.float = 'right';
        messageTextarea.parentElement.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - messageTextarea.value.length;
            counter.textContent = `${messageTextarea.value.length}/${maxLength} karakter`;
            
            if (remaining < 50) {
                counter.style.color = 'var(--text-danger, #dc3545)';
            } else {
                counter.style.color = 'var(--text-muted, #6c757d)';
            }
        }
        
        messageTextarea.addEventListener('input', updateCounter);
        messageTextarea.setAttribute('maxlength', maxLength);
        updateCounter();
    }
    
    console.log('Contact form initialized');
});
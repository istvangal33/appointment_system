// ====================================
// HARMÓNIA MASSZÁZS SZALON - MAIN JS
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================
    // NAVBAR SCROLL EFFECT
    // ====================================
    
    const navbar = document.querySelector('.navbar');
    
    function updateNavbar() {
        if (!navbar) return;
        
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
    
    window.addEventListener('scroll', updateNavbar);
    updateNavbar(); // Initial call
    
    // ====================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ====================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ====================================
    // FADE IN ANIMATION ON SCROLL
    // ====================================
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements
    const elementsToAnimate = document.querySelectorAll('.service-card, .feature-card, .section-title, .section-subtitle');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // ====================================
    // LOADING ANIMATION
    // ====================================
    
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Animate hero content with delay
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });
    
    // ====================================
    // MOBILE MENU CLOSE ON CLICK
    // ====================================
    
    const navLinks = document.querySelectorAll('.nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });
    });
    
    // ====================================
    // PARALLAX EFFECT FOR HERO SECTION
    // ====================================
    
    const heroSection = document.querySelector('.hero-section');
    
    function parallaxEffect() {
        if (!heroSection) return;
        
        const scrolled = window.pageYOffset;
        const parallax = heroSection.querySelector('.hero-overlay');
        
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    }
    
    window.addEventListener('scroll', parallaxEffect);
    
    // ====================================
    // BUTTON HOVER EFFECTS
    // ====================================
    
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ====================================
    // FLOATING CARD INTERACTION
    // ====================================
    
    const floatingCard = document.querySelector('.floating-card');
    
    if (floatingCard) {
        floatingCard.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
            this.style.transform = 'translateY(-70px) scale(1.05)';
        });
        
        floatingCard.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
            this.style.transform = 'translateY(-50%)';
        });
    }
    
    // ====================================
    // SERVICE CARDS STAGGER ANIMATION
    // ====================================
    
    const serviceCards = document.querySelectorAll('.service-card');
    
    const serviceObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(serviceCards).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });
    
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        serviceObserver.observe(card);
    });
    
    // ====================================
    // PHONE NUMBER FORMATTING
    // ====================================
    
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Analytics tracking could be added here
            console.log('Phone call initiated:', this.href);
        });
    });
    
    // ====================================
    // EMAIL LINKS TRACKING
    // ====================================
    
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Analytics tracking could be added here
            console.log('Email link clicked:', this.href);
        });
    });
    
    // ====================================
    // SCROLL TO TOP FUNCTIONALITY
    // ====================================
    
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopBtn);
    
    // Add CSS for scroll to top button
    const scrollToTopStyle = document.createElement('style');
    scrollToTopStyle.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(139, 115, 85, 0.3);
        }
        
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-to-top:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 25px rgba(139, 115, 85, 0.4);
        }
        
        @media (max-width: 768px) {
            .scroll-to-top {
                bottom: 20px;
                right: 20px;
                width: 45px;
                height: 45px;
            }
        }
    `;
    document.head.appendChild(scrollToTopStyle);
    
    // Show/hide scroll to top button
    function toggleScrollToTop() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleScrollToTop);
    
    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ====================================
    // PERFORMANCE OPTIMIZATIONS
    // ====================================
    
    // Throttle scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.onscroll = function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            if (originalScrollHandler) {
                originalScrollHandler();
            }
        }, 10);
    };
    
    // Preload important images
    const importantImages = [
        // Add any important image URLs here
    ];
    
    importantImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    console.log('Harmónia Masszázs Szalon - Website initialized');
});
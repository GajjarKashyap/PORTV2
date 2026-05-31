// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// ── Smooth Scroll (Lenis) ──
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easeOutQuint
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sync Lenis with GSAP
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// Scroll Progress Bar
const progressBar = document.getElementById('scroll-progress');
lenis.on('scroll', ({ scroll, limit }) => {
    if (progressBar) {
        const progress = limit > 0 ? (scroll / limit) * 100 : 0;
        progressBar.style.width = progress + '%';
    }
});


// ── Premium Custom Cursor (GSAP QuickTo) ──
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (window.matchMedia("(pointer: fine)").matches && cursorDot && cursorOutline) {
    // Reveal cursor
    gsap.set([cursorDot, cursorOutline], { opacity: 1 });

    // GSAP quickTo for zero-latency lerping
    const xDotSet = gsap.quickSetter(cursorDot, "x", "px");
    const yDotSet = gsap.quickSetter(cursorDot, "y", "px");

    const xOutlineTo = gsap.quickTo(cursorOutline, "x", { duration: 0.4, ease: "power3" });
    const yOutlineTo = gsap.quickTo(cursorOutline, "y", { duration: 0.4, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
        // Dot follows instantly
        xDotSet(e.clientX);
        yDotSet(e.clientY);
        // Outline lags elegantly
        xOutlineTo(e.clientX);
        yOutlineTo(e.clientY);
    });

    // Hover logic
    const interactables = document.querySelectorAll('a, button, .nav-menu-link, .btn-outline, .skill-pill');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursorOutline, { width: 80, height: 80, backgroundColor: "#fff", duration: 0.3 });
            gsap.to(cursorDot, { opacity: 0, duration: 0.1 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursorOutline, { width: 40, height: 40, backgroundColor: "transparent", duration: 0.3 });
            gsap.to(cursorDot, { opacity: 1, duration: 0.1 });
        });
    });

    // Massive hovers (Hero Header)
    const massiveTexts = document.querySelectorAll('.text-hover-interact');
    massiveTexts.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursorOutline, { width: 200, height: 200, backgroundColor: "#fff", mixBlendMode: "difference", duration: 0.4 });
            gsap.to(cursorDot, { opacity: 0, duration: 0.1 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursorOutline, { width: 40, height: 40, backgroundColor: "transparent", mixBlendMode: "difference", duration: 0.4 });
            gsap.to(cursorDot, { opacity: 1, duration: 0.1 });
        });
    });

    // Elegant Magnetic Physics for Buttons using GSAP
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        el.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = el.getBoundingClientRect();
            const x = (e.clientX - (left + width / 2)) * 0.4;
            const y = (e.clientY - (top + height / 2)) * 0.4;
            xTo(x);
            yTo(y);
        });

        el.addEventListener('mouseleave', () => {
            xTo(0);
            yTo(0);
        });
    });
}


// ── Navbar Logic ──
const navbar = document.getElementById('navbar');
if (navbar) {
    ScrollTrigger.create({
        start: 'top -60',
        end: 99999,
        toggleClass: { className: 'py-5', targets: navbar }
    });
}

// Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.nav-menu-link');

if (hamburger && mobileMenu) {
    const menuText = hamburger.querySelector('span');
    const bars = hamburger.querySelectorAll('div > span');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;

        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            gsap.fromTo(mobileMenu,
                { yPercent: -100 },
                { yPercent: 0, duration: 0.8, ease: "power4.inOut" }
            );

            // Stagger menu links
            gsap.fromTo(mobileLinks,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: "power3.out" }
            );

            if (menuText) menuText.textContent = "CLOSE";
            if (bars.length >= 2) {
                gsap.to(bars[0], { y: 3.5, rotation: 45, duration: 0.4 });
                gsap.to(bars[1], { y: -3.5, rotation: -45, duration: 0.4 });
            }

            lenis.stop(); // Stop scroll when menu open
        } else {
            gsap.to(mobileMenu, {
                yPercent: -100,
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => mobileMenu.classList.add('hidden')
            });

            if (menuText) menuText.textContent = "MENU";
            if (bars.length >= 2) {
                gsap.to(bars[0], { y: 0, rotation: 0, duration: 0.4 });
                gsap.to(bars[1], { y: 0, rotation: 0, duration: 0.4 });
            }

            lenis.start();
        }
    }
    hamburger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));
}


// ── Page Load Choreography, Preloader & Text Reveals ──

window.addEventListener("load", () => {

    const preloader = document.getElementById('preloader');
    const preloaderText = document.getElementById('preloader-text');
    const preloaderCircle = document.getElementById('preloader-circle');

    // Create an elegant timeline for the preloader
    const tl = gsap.timeline({
        onStart: () => lenis.stop(), // freeze screen
        onComplete: () => lenis.start()
    });

    if (preloader && preloaderText && preloaderCircle) {
        // Calculate max scale to cover the viewport plus a safe margin
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        const targetScale = (maxDim * 2.5) / 10; // Initial circle size is 10px

        tl.to(preloaderText, { opacity: 1, duration: 0.8, ease: "power2.out" })
            .to(preloaderText, { scale: 1.05, duration: 0.8, ease: "none" }) // subtle text tension
            .to(preloaderCircle, { opacity: 1, duration: 0.01 }, "-=0.3") // Make circle visible
            .to(preloaderCircle, { scale: targetScale, duration: 0.9, ease: "power4.inOut" }, "-=0.3") // Expand circle
            .to(preloaderText, { color: "#F5F0EB", duration: 0.1 }, "-=0.6") // Invert text color over dark circle
            .to(preloaderText, { opacity: 0, duration: 0.4, y: -10, ease: "power2.in" }, "-=0.1") // Text fades out
            .to(preloader, { opacity: 0, duration: 1, ease: "power3.inOut" }, "-=0.2") // Whole preloader fades revealing #hero
            .set(preloader, { display: "none" }); // hide from DOM
    }

    // 1. Initial Navbar entrance AFTER preloader
    tl.to(navbar, { y: 0, duration: 1.2, ease: "power3.out" }, "-=0.7");

    // 2. Prepare SplitType for Hero Header and Section Headers
    const revealBlocks = document.querySelectorAll('.reveal-block');
    revealBlocks.forEach(block => {
        gsap.set(block, { autoAlpha: 1 }); // Clear CSS hidden state

        // Split text into lines and characters
        const text = new SplitType(block, { types: 'lines, words, chars' });

        // Wrap lines in an overflow hidden div to act as a mask
        text.lines.forEach(line => {
            const wrapper = document.createElement('div');
            wrapper.style.overflow = 'hidden';
            wrapper.style.display = 'inline-block';
            wrapper.style.verticalAlign = 'bottom';
            
            // Fix for italic and large text getting cut off at edges
            wrapper.style.paddingBottom = '0.3em';
            wrapper.style.marginBottom = '-0.3em';
            wrapper.style.paddingRight = '0.15em';
            wrapper.style.marginRight = '-0.15em';

            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
        });

        // Intro animation for Hero H1
        if (block.tagName === 'H1') {
            tl.from(text.chars, {
                yPercent: 100,
                autoAlpha: 0,
                rotateZ: 4,
                duration: 1.2,
                stagger: 0.02,
                ease: "power4.out"
            }, "-=0.8"); // Sync with navbar dropping in
        }
        // ScrollTrigger animation for other headers
        else {
            gsap.from(text.chars, {
                scrollTrigger: {
                    trigger: block,
                    start: "top 85%",
                },
                yPercent: 100,
                autoAlpha: 0,
                rotateZ: 2,
                duration: 1,
                stagger: 0.015,
                ease: "power3.out"
            });
        }
    });

    // 3. Stagger fade-in sections natively with GSAP instead of CSS
    const fadeSections = gsap.utils.toArray('.fade-in-section');
    fadeSections.forEach(section => {
        gsap.set(section, { autoAlpha: 1 }); // Clear CSS hidden state

        // If it's already in the hero, just animate it immediately
        if (section.closest('.hero-grain')) {
            tl.fromTo(section,
                { autoAlpha: 0, y: 30 },
                { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out" },
                "-=0.9"
            );
        } else {
            gsap.fromTo(section,
                { autoAlpha: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                    },
                    autoAlpha: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power3.out"
                }
            );
        }
    });

    // 4. Philosophy Text specialized split
    gsap.set('#philosophy-text', { autoAlpha: 1 }); // Clear CSS hidden state
    const philosophyText = new SplitType('#philosophy-text', { types: 'chars' });
    philosophyText.chars.forEach(char => {
        // Emulate the CSS scale hover via JS for better control, or let CSS handle it.
        // The CSS is currently handling it beautifully, so we leave it! 
        // But we add an entrance animation:
        gsap.from(char, {
            scrollTrigger: {
                trigger: '#philosophy-text',
                start: "top 80%"
            },
            autoAlpha: 0,
            y: 20,
            scale: 0.8,
            duration: 0.6,
            stagger: 0.01,
            ease: "back.out(1.5)"
        });
    });

    // Skills Animation (Circular Progress Rings)
    const skillRings = document.querySelectorAll('.skill-ring');
    if (skillRings.length > 0) {
        gsap.to(skillRings, {
            scrollTrigger: {
                trigger: "#skills",
                start: "top 80%",
            },
            strokeDashoffset: (i, el) => {
                const target = parseInt(el.getAttribute('data-target'));
                const circumference = 251; // 2 * PI * 40
                return circumference - (circumference * target / 100);
            },
            duration: 1.5,
            ease: "power3.out",
            stagger: 0.1
        });
    }

    // Refresh ScrollTrigger after initial DOM load to fix layout offsets
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);

    // After preloader timeline finishes, initialize new effects
    tl.call(() => {
        if (typeof CursorTrail !== 'undefined') CursorTrail.init();
        if (typeof ProjectPanel !== 'undefined') ProjectPanel.init();
        if (typeof Terminal !== 'undefined') Terminal.init();
        if (typeof GitHubAPI !== 'undefined') GitHubAPI.applyToPage();
        
        if (window.innerWidth >= 768 && typeof TextScramble !== 'undefined') {
            setTimeout(() => {
                const heroHeading = document.querySelector('.hero-grain h1');
                if (heroHeading) {
                    // Stash original HTML so we can restore the exact structure after scrambling
                    const originalHTML = heroHeading.innerHTML;
                    
                    // Wrap the three text lines in spans we can target securely without breaking HTML
                    heroHeading.innerHTML = `<span class="scramble-node">Builds Things</span><br><span class="italic text-theme-muted scramble-node">Always-Next</span><br><span class="scramble-node">Level.</span>`;
                    
                    const nodes = heroHeading.querySelectorAll('.scramble-node');
                    if (nodes.length === 3) {
                        const scramble1 = new TextScramble(nodes[0]);
                        const scramble2 = new TextScramble(nodes[1]);
                        const scramble3 = new TextScramble(nodes[2]);
                        
                        Promise.all([
                            scramble1.setText("Builds Things"),
                            new Promise(r => setTimeout(() => scramble2.setText("Always-Next").then(r), 400)),
                            new Promise(r => setTimeout(() => scramble3.setText("Level.").then(r), 750))
                        ]).then(() => {
                            // Recreate the exact HTML with <br> tags so SplitType splits it correctly
                            heroHeading.innerHTML = `Builds Things<br><span class="italic text-theme-muted">Always-Next</span><br>Level.`;
                            
                            // Re-run SplitType so the hover interact effect works again
                            if (typeof window.SplitType !== 'undefined') {
                                const text = new window.SplitType(heroHeading, { types: 'lines, words, chars' });
                                text.lines.forEach(line => {
                                    const wrapper = document.createElement('div');
                                    wrapper.style.overflow = 'hidden';
                                    wrapper.style.display = 'block';
                                    wrapper.className = 'line-mask';
                                    line.parentNode.insertBefore(wrapper, line);
                                    wrapper.appendChild(line);
                                });
                            }
                        });
                    }
                }
            }, 300);
        }
    });
});

const copyrightYearSpan = document.getElementById('copyright-year');
if (copyrightYearSpan) {
    copyrightYearSpan.textContent = new Date().getFullYear();
}

// ── JSON Card 3D Tilt ──
const jsonCard = document.getElementById('json-card');
if (jsonCard) {
    let ticking = false;
    jsonCard.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const rect = jsonCard.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const tiltX = y * -15;  // deeper tilt
                const tiltY = x * 15;

                gsap.to(jsonCard, {
                    rotationX: tiltX,
                    rotationY: tiltY,
                    transformPerspective: 800,
                    scale: 1.02,
                    duration: 0.4,
                    ease: "power2.out"
                });
                ticking = false;
            });
            ticking = true;
        }
    });
    jsonCard.addEventListener('mouseleave', () => {
        gsap.to(jsonCard, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.7,
            ease: "elastic.out(1, 0.4)"
        });
    });
}

// ── Magnetic Elements Micro-interaction ──
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        // Calculate mouse position relative to the center of the element
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Move element slightly (30% of distance from center)
        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: "power2.out"
        });
    });

    el.addEventListener('mouseleave', () => {
        // Reset element position
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// ── Live Clock ──
function updateClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    const options = { timeZoneName: 'short' };
    const tzName = new Intl.DateTimeFormat('en-US', options).format(now).split(' ').pop();
    clockElement.textContent = `${timeString} (${tzName})`;
}
setInterval(updateClock, 1000);
updateClock();

// ── jQuery Ripples (Untouched logic, wrapped safely) ──
if (typeof jQuery !== 'undefined') {
    $(document).ready(function () {
        const $rippleSection = $('#water-ripple-wrapper');

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const grd = ctx.createLinearGradient(0, 0, 512, 512);
        grd.addColorStop(0, '#FFFFFF');
        grd.addColorStop(0.4, '#F5F0EB');
        grd.addColorStop(1, '#D8D0C8');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 512, 512);
        const bgUrl = canvas.toDataURL();

        $rippleSection.css({
            'background-image': `url(${bgUrl})`,
            'background-size': 'cover',
            'background-repeat': 'no-repeat',
            'background-position': 'center',
            'background-attachment': 'fixed'
        });

        try {
            $rippleSection.ripples({
                resolution: 256,
                dropRadius: 80,
                perturbance: 0.05,
                interactive: false
            });

            $rippleSection.on('mousedown touchstart', function (e) {
                let clientX = e.clientX || (e.touches && e.touches[0].clientX);
                let clientY = e.clientY || (e.touches && e.touches[0].clientY);

                if (clientX !== undefined && clientY !== undefined) {
                    const offset = $rippleSection.offset();
                    const x = clientX - offset.left;
                    const y = clientY - offset.top + $(window).scrollTop();
                    $rippleSection.ripples('drop', x, y, 80, 0.15);
                }
            });
        } catch (e) {
            console.warn("WebGL ripples failed to initialize.");
        }
    });
}

// ── Text Scramble Effect ──
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText || "";
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(i * 1.8);       
      const end = start + Math.floor(Math.random() * 12) + 6;
      this.queue.push({ from, to, start, end, char: '' });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0; i < this.queue.length; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:#C8A97E;opacity:0.7">${char}</span>`;
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// ── Cursor Trail Effect ──
const CursorTrail = (() => {
  const CONFIG = {
    particleCount: 1,        
    maxParticles: 40,        
    size: { min: 4, max: 10 },       
    life: 700,               
    colors: ['#C8A97E', '#1A1A1A', '#6B6B6B'],  
    spawnThreshold: 8,       
  };

  let particles = [];
  let lastX = 0, lastY = 0;

  function createParticle(x, y) {
    const size = CONFIG.size.min + Math.random() * (CONFIG.size.max - CONFIG.size.min);
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 98;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${x - size/2}px;
      top: ${y - size/2}px;
      opacity: 0.6;
      transform: scale(1);
      transition: none;
      will-change: opacity, transform;
    `;
    document.body.appendChild(el);
    
    return {
      el,
      born: performance.now(),
      life: CONFIG.life + Math.random() * 200, 
    };
  }

  function tick(now) {
    particles = particles.filter(p => {
      const age = now - p.born;
      const progress = age / p.life;  
      
      if (progress >= 1) {
        p.el.remove();
        return false;
      }
      
      const eased = 1 - Math.pow(progress, 1.5);
      p.el.style.opacity = (0.6 * eased).toFixed(3);
      p.el.style.transform = `scale(${(1 - progress * 0.5).toFixed(3)})`;
      return true;
    });
    
    requestAnimationFrame(tick);
  }

  function onMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    const dx = x - lastX;
    const dy = y - lastY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < CONFIG.spawnThreshold) return;  
    if (particles.length >= CONFIG.maxParticles) return;
    
    lastX = x;
    lastY = y;
    
    particles.push(createParticle(x, y));
  }

  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    requestAnimationFrame(tick);
  }

  return { init };
})();

// ── Stats Counter ──
const counters = document.querySelectorAll('.counter');
counters.forEach((counter, i) => {
  const target = parseInt(counter.dataset.target);
  const suffix = counter.dataset.suffix || '';
  
  gsap.set(counter, { opacity: 0, y: 20 });
  
  ScrollTrigger.create({
    trigger: counter,
    start: 'top 85%',
    once: true,   
    onEnter: () => {
      gsap.to(counter, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: i * 0.1,   
        ease: 'power2.out'
      });
      
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.8,
        delay: i * 0.1 + 0.2,
        ease: 'power2.out',
        onUpdate: function() {
          counter.textContent = Math.ceil(this.targets()[0].val) + suffix;
        },
        onComplete: () => {
          counter.textContent = target + suffix;  
        }
      });
    }
  });
});

// ── PROJECT DATA ──
const PROJECT_DATA = {
  'lan-file-tunnel': {
    index: '01',
    title: 'LAN-FILE-TUNNEL',
    problem: 'Transferring files across devices on the same network always meant either setting up FTP servers, using cloud storage with upload limits, or physically connecting cables. None of that is fast. This tool removes all friction — open a browser, drag a file, done.',
    stack: ['Python', 'Flask', 'HTML/CSS', 'JavaScript', 'Local Network'],
    challenge: 'Handling large file streams without buffering the entire file into memory, and making the browser drag-and-drop interface work across all OS combinations on a local network.',
    learned: 'Network I/O at the socket level behaves very differently from HTTP abstractions. Flask\'s streaming responses were the key unlock — chunked transfer encoding made large files viable.',
    github: 'https://github.com/GajjarKashyap/LAN-FILE-TUNNEL',
    live: null,
  },
  'vocalizer': {
    index: '02',
    title: 'Vocalizer',
    problem: 'Audio format conversion and basic signal processing tools are either bloated desktop apps or expensive SaaS products. There was no simple, browser-based tool for quick audio manipulation without installing anything.',
    stack: ['Python', 'Flask', 'Web Audio API', 'JavaScript'],
    challenge: 'Browser audio processing has strict security constraints. Getting real-time signal visualization working alongside format conversion without blocking the UI thread required careful Web Worker architecture.',
    learned: 'The Web Audio API is far more powerful than most developers use it for. Signal processing in the browser is entirely viable — the constraint is architecture, not capability.',
    github: 'https://github.com/GajjarKashyap/Audio',
    live: null,
  },
  'global-clipboard': {
    index: '03',
    title: 'Global-Clipboard',
    problem: 'Copying text on one device and needing it on another requires cloud sync apps, email to yourself, or proprietary ecosystems. This solves it with a shared real-time clipboard that works across any device with a browser.',
    stack: ['Python', 'Flask', 'Firebase', 'JavaScript', 'WebSockets'],
    challenge: 'Real-time sync across devices requires handling conflict resolution when two devices write simultaneously, and keeping latency low enough that it feels instantaneous.',
    learned: 'Firebase Realtime Database handles the hard parts of distributed state — but you still need to think carefully about data structure to avoid fan-out problems at scale.',
    github: 'https://github.com/GajjarKashyap/GLOBAL-CLIP-BOARD',
    live: null,
  },
  'dev-track': {
    index: '04',
    title: 'Dev Track',
    problem: 'Students need a fast, reliable place to capture notes without fighting a complex tool. Most note apps are over-engineered for casual academic use. Dev Track is purpose-built: open it, write, it saves, it syncs.',
    stack: ['Firebase', 'JavaScript', 'HTML/CSS', 'Markdown'],
    challenge: 'Making real-time cloud sync feel seamless without an internet connection — offline-first architecture with sync-on-reconnect required careful use of Firebase\'s persistence layer.',
    learned: 'The gap between "it works" and "it feels reliable" is entirely about handling edge cases — offline states, sync conflicts, and graceful error recovery.',
    github: null,
    live: 'https://tracker-1-e4432.web.app/',
  },
};

// ── PROJECT PANEL LOGIC ──
const ProjectPanel = (() => {
  const overlay = document.getElementById('project-overlay');
  const backdrop = document.getElementById('project-backdrop');
  const panel = document.getElementById('project-panel');
  const closeBtn = document.getElementById('panel-close');
  let isOpen = false;
  let currentKey = null;

  function open(projectKey) {
    const data = PROJECT_DATA[projectKey];
    if (!data) return;
    currentKey = projectKey;

    document.getElementById('panel-index').textContent = data.index;
    document.getElementById('panel-title').textContent = data.title;
    document.getElementById('panel-problem').textContent = data.problem;
    document.getElementById('panel-challenge').textContent = data.challenge;
    document.getElementById('panel-learned').textContent = data.learned;

    const stackEl = document.getElementById('panel-stack');
    stackEl.innerHTML = data.stack
      .map(s => `<span class="skill-pill">${s}</span>`)
      .join('');

    const linksEl = document.getElementById('panel-links');
    linksEl.innerHTML = '';
    if (data.github) {
      linksEl.innerHTML += `
        <a href="${data.github}" target="_blank" rel="noopener noreferrer"
           class="btn-outline text-[11px]">View Source</a>`;
    }
    if (data.live) {
      linksEl.innerHTML += `
        <a href="${data.live}" target="_blank" rel="noopener noreferrer"
           class="btn-outline text-[11px]">Visit Live</a>`;
    }

    overlay.classList.remove('pointer-events-none');
    overlay.setAttribute('aria-hidden', 'false');
    gsap.to(backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.to(panel, { 
      x: 0, 
      duration: 0.6, 
      ease: 'power3.out',
      onStart: () => { panel.scrollTop = 0; }
    });

    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function close() {
    if (!isOpen) return;
    gsap.to(panel, { x: '100%', duration: 0.5, ease: 'power3.in' });
    gsap.to(backdrop, { 
      opacity: 0, 
      duration: 0.4, 
      delay: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        overlay.classList.add('pointer-events-none');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
    isOpen = false;
    currentKey = null;
  }

  function init() {
    if(!closeBtn) return;
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });

    document.querySelectorAll('[data-project]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => open(card.dataset.project));
    });
  }

  return { init, open, close };
})();

// ── TERMINAL LOGIC ──
const Terminal = (() => {
  const overlay = document.getElementById('terminal-overlay');
  const output = document.getElementById('terminal-output');
  const input = document.getElementById('terminal-input');
  let isOpen = false;
  let history = [];
  let historyIndex = -1;

  const BOOT_MESSAGE = `
<span class="text-theme-accent">GK Terminal v1.0.0</span>
<span class="text-white/30">─────────────────────────────────</span>
<span class="text-white/50">Type <span class="text-white">help</span> to see available commands.</span>

`;

  const COMMANDS = {
    help: () => `
<span class="text-theme-accent">Available commands:</span>

  <span class="text-white">about</span>       — Who is Gajjar Kashyap
  <span class="text-white">projects</span>    — List all projects
  <span class="text-white">skills</span>      — Show skill levels
  <span class="text-white">security</span>    — Security tools built
  <span class="text-white">contact</span>     — Get in touch
  <span class="text-white">open [n]</span>    — Open project by number
  <span class="text-white">github</span>      — Open GitHub profile
  <span class="text-white">clear</span>       — Clear terminal
  <span class="text-white">exit</span>        — Close terminal

`,
    about: () => `
<span class="text-theme-accent">Gajjar Kashyap</span>
<span class="text-white/50">Python developer · Security researcher · Systems thinker</span>

I use AI as a power tool — not a shortcut — to build real software.
My brain drives the logic, the architecture, and the vision.
AI accelerates the execution.

<span class="text-white/30">Status: Always Thinking</span>

`,
    projects: () => `
<span class="text-theme-accent">Projects:</span>

  <span class="text-white">[01]</span> LAN-FILE-TUNNEL   — Local network file sharing via browser
  <span class="text-white">[02]</span> Vocalizer         — Audio manipulation & signal processing
  <span class="text-white">[03]</span> Global-Clipboard  — Real-time cross-device clipboard sync
  <span class="text-white">[04]</span> Dev Track         — Student notes app with cloud sync

  Type <span class="text-white">open 1</span> through <span class="text-white">open 4</span> to explore any project.

`,
    skills: () => `
<span class="text-theme-accent">Skills:</span>

  Python        ████████████████████ 90%
  HTML/CSS      ███████████████████░ 92%
  Flask         █████████████████░░░ 85%
  Firebase      ████████████████░░░░ 80%
  Linux/Kali    ████████████████████ 88%
  JavaScript    ███████████████░░░░░ 75%
  C/C++         ██████████████░░░░░░ 70%
  Figma         █████████████░░░░░░░ 65%

`,
    security: () => `
<span class="text-theme-accent">Security Tools:</span>

  <span class="text-white">WiFi Brute-Force</span>
  Tests WPA/WPA2 networks against password lists.
  Stack: Python · Kali Linux

  <span class="text-white">File Password Cracker</span>
  Iterates candidates to unlock encrypted archives.
  Stack: Python · Brute-Force

  <span class="text-white">AES-256 Encryptor</span>
  Encrypt/decrypt messages with 256-bit AES.
  Stack: Python · Cryptography

  <span class="text-white/30">All tools built for educational & research purposes.</span>

`,
    contact: () => `
<span class="text-theme-accent">Get in touch:</span>

  Email   → kashayapgajjar71@gmail.com
  GitHub  → github.com/GajjarKashyap

  Open to collaborations, freelance, and interesting conversations.

`,
    github: () => {
      setTimeout(() => window.open('https://github.com/GajjarKashyap', '_blank'), 300);
      return `<span class="text-white/50">Opening GitHub profile...</span>\n`;
    },
    clear: () => {
      output.innerHTML = BOOT_MESSAGE;
      return null;
    },
    exit: () => {
      setTimeout(() => Terminal.close(), 300);
      return `<span class="text-white/50">Closing terminal...</span>\n`;
    },
  };

  function print(html) {
    output.innerHTML += html;
    output.scrollTop = output.scrollHeight;
  }

  function handleCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    history.unshift(cmd);
    historyIndex = -1;

    print(`<div class="text-white/40">gk@portfolio:~$ <span class="text-white">${raw}</span></div>`);

    if (cmd.startsWith('open ')) {
      const n = parseInt(cmd.split(' ')[1]);
      const keys = ['lan-file-tunnel', 'vocalizer', 'global-clipboard', 'dev-track'];
      if (n >= 1 && n <= 4) {
        print(`<div class="text-white/50">Opening project ${n}...</div>\n`);
        setTimeout(() => {
          Terminal.close();
          ProjectPanel.open(keys[n - 1]);
        }, 400);
        return;
      } else {
        print(`<div class="text-red-400/70">Project ${n} not found. Try 1–4.</div>\n`);
        return;
      }
    }

    const sectionMap = {
      about: '#about',
      projects: '#projects', 
      security: '#security',
      contact: '#contact',
      skills: '#skills',
    };

    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd]();
      if (result !== null) print(result);
    } else if (sectionMap[cmd]) {
      print(`<div class="text-white/50">Navigating to ${cmd}...</div>\n`);
      setTimeout(() => {
        Terminal.close();
        document.querySelector(sectionMap[cmd])?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      print(`<div class="text-red-400/70">Command not found: ${cmd}</div>
<div class="text-white/30">Type <span class="text-white">help</span> to see available commands.</div>\n`);
    }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.remove('pointer-events-none');
    overlay.setAttribute('aria-hidden', 'false');
    output.innerHTML = BOOT_MESSAGE;
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    setTimeout(() => input.focus(), 350);
  }

  function close() {
    if (!isOpen) return;
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        overlay.classList.add('pointer-events-none');
        overlay.setAttribute('aria-hidden', 'true');
        input.value = '';
      }
    });
    isOpen = false;
  }

  function init() {
    if(!overlay) return;
    document.addEventListener('keydown', e => {
      const tag = document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '\`' || e.key === '/') {
        e.preventDefault();
        isOpen ? close() : open();
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        close();
        return;
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        handleCommand(input.value);
        input.value = '';
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex];
        } else {
          historyIndex = -1;
          input.value = '';
        }
      }
      if (e.key === 'Escape') close();
    });
  }

  return { init, open, close };
})();

// ── GITHUB API INTEGRATION ──
const GitHubAPI = (() => {
  const USERNAME = 'GajjarKashyap';
  const CACHE_KEY = 'gk_github_cache';
  const CACHE_TTL = 60 * 60 * 1000;

  async function fetchFresh() {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`)
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');

    const user = await userRes.json();
    const repos = await reposRes.json();

    const langCount = {};
    repos.forEach(repo => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });

    const data = {
      publicRepos: user.public_repos,
      followers: user.followers,
      totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      topLanguages: Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang),
      repoData: repos.reduce((acc, r) => {
        acc[r.name] = {
          stars: r.stargazers_count,
          forks: r.fork_count,
          updatedAt: r.updated_at,
        };
        return acc;
      }, {}),
      fetchedAt: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }

  async function get() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
          return parsed;
        }
      }
      return await fetchFresh();
    } catch (err) {
      console.warn('GitHub API unavailable, using fallback data');
      return null;
    }
  }

  async function applyToPage() {
    const data = await get();
    if (!data) return;

    const statMap = {
      'repos':     data.publicRepos,
      'stars':     data.totalStars,
      'followers': data.followers,
    };

    document.querySelectorAll('[data-stat]').forEach(el => {
      const key = el.dataset.stat;
      if (statMap[key] !== undefined) {
        el.dataset.target = statMap[key];
        if (el.textContent === "0" || el.textContent === "") {
          el.textContent = statMap[key];
        }
      }
    });

    const lastRepo = Object.values(data.repoData)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    if (lastRepo) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(lastRepo.updatedAt)) / (1000 * 60 * 60 * 24)
      );
      const badge = document.getElementById('last-active-badge');
      if (badge) {
        badge.textContent = daysAgo === 0 
          ? 'Active today' 
          : `Last shipped: ${daysAgo}d ago`;
        badge.style.visibility = 'visible';
      }
    }
  }

  return { get, applyToPage };
})();

// ── BANNER LOGIC ──
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById('availability-banner');
  const bannerClose = document.getElementById('banner-close');
  
  if (banner && bannerClose) {
    if (sessionStorage.getItem('banner_dismissed')) {
      banner.style.display = 'none';
    }
    
    bannerClose.addEventListener('click', () => {
      banner.style.display = 'none';
      sessionStorage.setItem('banner_dismissed', '1');
    });
  }
});

// ── GLOBAL ANCHOR SMOOTH SCROLL (LENIS) ──
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        // Close terminal if open
        if (typeof Terminal !== 'undefined' && typeof Terminal.close === 'function') {
          Terminal.close();
        }
        // Smooth scroll via Lenis
        if (typeof lenis !== 'undefined') {
          lenis.scrollTo(targetElement, { offset: 0 });
        } else {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});

// ── INTERACTIVE SPOTLIGHT ON PROJECT CARDS ──
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    // Elevate children so they sit above spotlight
    Array.from(card.children).forEach(child => {
      child.style.position = 'relative';
      child.style.zIndex = '10';
    });

    // Create Spotlight
    const spotlight = document.createElement('div');
    spotlight.style.position = 'absolute';
    spotlight.style.inset = '0';
    spotlight.style.pointerEvents = 'none';
    spotlight.style.zIndex = '0';
    spotlight.style.opacity = '0';
    spotlight.style.transition = 'opacity 0.4s ease';
    spotlight.style.background = 'radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(200, 169, 126, 0.12), transparent 40%)';
    card.appendChild(spotlight);

    // Track mouse
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseenter', () => {
      spotlight.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
  });
});




// ============================================================
//  IMAGE TAB GALLERY — Interactive Chart Simulator
// ============================================================

const SIM_TOTAL   = 9;      // total slides
const SIM_DELAY   = 4000;   // ms per slide for auto-play
const SIM_TICK    = 50;     // progress bar tick interval (ms)

let simCurrent    = 0;
let simTimer      = null;
let simProgress   = 0;      // 0..100
let simTickTimer  = null;
let simPaused     = false;

// Activate a slide by index
function simGoTo(index) {
  const prevSlide = document.getElementById(`simSlide${simCurrent}`);
  const prevTab   = document.getElementById(`simTab${simCurrent}`);
  const prevDot   = document.getElementById(`simDot${simCurrent}`);

  if (prevSlide) prevSlide.classList.remove('active');
  if (prevTab)   prevTab.classList.remove('active');
  if (prevDot)   prevDot.classList.remove('active');

  simCurrent = ((index % SIM_TOTAL) + SIM_TOTAL) % SIM_TOTAL;

  const nextSlide = document.getElementById(`simSlide${simCurrent}`);
  const nextTab   = document.getElementById(`simTab${simCurrent}`);
  const nextDot   = document.getElementById(`simDot${simCurrent}`);

  if (nextSlide) nextSlide.classList.add('active');
  if (nextTab)   nextTab.classList.add('active');
  if (nextDot)   nextDot.classList.add('active');

  // Scroll active tab horizontally into view within the tab bar container (avoiding page scroll hijacking)
  const tabsContainer = document.getElementById('simTabs');
  if (nextTab && tabsContainer) {
    const containerWidth = tabsContainer.clientWidth;
    const tabOffsetLeft = nextTab.offsetLeft;
    const tabWidth = nextTab.offsetWidth;
    tabsContainer.scrollTo({
      left: tabOffsetLeft - (containerWidth / 2) + (tabWidth / 2),
      behavior: 'smooth'
    });
  }

  // Reset progress
  simProgress = 0;
  updateProgressBar();
}

function updateProgressBar() {
  const fill = document.getElementById('simProgressFill');
  if (fill) fill.style.width = simProgress + '%';
}

function simStartAutoplay() {
  clearInterval(simTickTimer);
  simTickTimer = setInterval(() => {
    if (simPaused) return;
    simProgress += (SIM_TICK / SIM_DELAY) * 100;
    if (simProgress >= 100) {
      simProgress = 0;
      simGoTo(simCurrent + 1);
    }
    updateProgressBar();
  }, SIM_TICK);
}

function initSimulator() {
  const viewer = document.getElementById('simImageViewer');
  if (!viewer) return;

  // Tab click handlers
  for (let i = 0; i < SIM_TOTAL; i++) {
    const tab = document.getElementById(`simTab${i}`);
    const dot = document.getElementById(`simDot${i}`);

    if (tab) {
      tab.addEventListener('click', () => {
        simGoTo(i);
        simProgress = 0;
        updateProgressBar();
      });
    }

    if (dot) {
      dot.addEventListener('click', () => {
        simGoTo(i);
        simProgress = 0;
        updateProgressBar();
      });
    }
  }

  // Pause on hover to let users read the screenshot
  viewer.addEventListener('mouseenter', () => { simPaused = true; });
  viewer.addEventListener('mouseleave', () => { simPaused = false; });

  // Touch swipe support (left/right)
  let touchStartX = 0;
  viewer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewer.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      simGoTo(simCurrent + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });

  // Start from slide 0
  simGoTo(0);
  simStartAutoplay();
}


// ============================================================
//  FAQ ACCORDION
// ============================================================

function initFaq() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const answer   = q.nextElementSibling;
      const isActive = q.classList.contains('active');

      // Close all
      faqQuestions.forEach(item => {
        item.classList.remove('active');
        item.nextElementSibling.style.maxHeight = null;
      });

      // Open clicked one
      if (!isActive) {
        q.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}


// ============================================================
//  CHECKOUT MODAL
// ============================================================

function initCheckout() {
  const modalOverlay      = document.getElementById('checkoutModal');
  const closeModalBtn     = document.getElementById('closeModal');
  const payButtons        = document.querySelectorAll('.btn-buy');
  const checkoutTitle     = document.getElementById('checkoutTitleText');
  const checkoutPrice     = document.getElementById('checkoutItemPriceText');
  const checkoutPlanName  = document.getElementById('checkoutPlanNameText');
  const checkoutForm      = document.getElementById('checkoutForm');
  const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');
  const checkoutSubmitTxt = document.getElementById('checkoutSubmitText');
  const checkoutSpinner   = document.getElementById('checkoutSpinner');

  function openCheckout(planName, price) {
    if (!modalOverlay) return;
    checkoutPlanName.textContent  = planName;
    checkoutPrice.textContent     = price;
    checkoutTitle.textContent     = `Get Access to ${planName}`;
    checkoutForm.reset();
    checkoutSpinner.style.display = 'none';
    checkoutSubmitTxt.textContent = 'Complete Invitation Process';
    checkoutSubmitBtn.disabled    = false;
    modalOverlay.classList.add('active');
  }

  function closeCheckout() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
  }

  payButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCheckout(btn.getAttribute('data-plan'), btn.getAttribute('data-price'));
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckout);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCheckout();
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('checkoutEmail');
      if (!emailInput.value) return;

      checkoutSpinner.style.display = 'block';
      checkoutSubmitTxt.textContent = 'Processing Payment Gateway...';
      checkoutSubmitBtn.disabled    = true;

      setTimeout(() => {
        checkoutSpinner.style.display = 'none';
        checkoutSubmitTxt.textContent = 'Access Approved! Redirecting...';
        setTimeout(() => {
          closeCheckout();
          alert(`Success! An invite-only license key and setup guide has been sent to ${emailInput.value}. Please verify your inbox!`);
        }, 1000);
      }, 2000);
    });
  }
}


// ============================================================
//  BOOT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initSimulator();
  initFaq();
  initCheckout();
});

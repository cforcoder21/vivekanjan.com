// =============================================================
// clerk-auth.js  —  vivekanjan.com
// Drop this file at: frontend/js/clerk-auth.js
// Include on EVERY page AFTER the Clerk CDN script
// =============================================================

// ── CONFIGURATION ─────────────────────────────────────────────
// Replace with your actual Clerk Publishable Key from:
// https://dashboard.clerk.com → Your App → API Keys
const CLERK_PUBLISHABLE_KEY = 'pk_test_bm90YWJsZS1wb3NzdW0tMi5jbGVyay5hY2NvdW50cy5kZXYk';
let clerkLoadPromise = null;

// ── INITIALIZE CLERK ──────────────────────────────────────────
// Clerk CDN script must be loaded before this file
// The window.Clerk object becomes available after load

window.addEventListener('load', async () => {
  try {
    await ensureClerkLoaded();
  } catch (err) {
    console.error('Clerk failed to load:', err);
  }
});

async function ensureClerkLoaded() {
  if (!window.Clerk) {
    throw new Error('Clerk script is not available on this page.');
  }

  if (Clerk.loaded) {
    return;
  }

  if (!clerkLoadPromise) {
    clerkLoadPromise = Clerk.load({ publishableKey: CLERK_PUBLISHABLE_KEY })
      .then(() => {
        initAuthUI();
        initCartProtection();
        restorePendingCartItem();
      })
      .catch((error) => {
        clerkLoadPromise = null;
        throw error;
      });
  }

  await clerkLoadPromise;
}

function getSignInProps() {
  return {
    forceRedirectUrl: window.location.href,
    fallbackRedirectUrl: window.location.href,
    signUpForceRedirectUrl: window.location.href,
    signUpFallbackRedirectUrl: window.location.href,
    withSignUp: true,
    appearance: {
      variables: {
        colorPrimary: '#40a80c',
        colorBackground: '#f9f6f0',
        colorText: '#1a1a1a',
        colorInputText: '#1a1a1a',
        colorInputBackground: '#ffffff',
        borderRadius: '8px',
        fontFamily: "'EB Garamond', Georgia, serif",
      },
      elements: {
        card: 'clerk-card-override',
        formButtonPrimary: 'clerk-btn-override',
      }
    }
  };
}

// ── AUTH UI — updates the header icons on every page ──────────
function initAuthUI() {
  const headerIcons = document.querySelector('.header-icons');
  if (!headerIcons) return;

  const user = Clerk.user;

  if (user) {
    // ── LOGGED IN: show user avatar + sign out ───────────────
    renderLoggedInHeader(headerIcons, user);
  } else {
    // ── LOGGED OUT: show Sign In button ─────────────────────
    renderLoggedOutHeader(headerIcons);
  }
}

function renderLoggedInHeader(container, user) {
  // Find the existing user icon anchor and replace it
  const userAnchor = container.querySelector('a[title="Sign In"]');
  if (!userAnchor) return;

  // Build user menu
  const userMenu = document.createElement('div');
  userMenu.className = 'clerk-user-menu';
  userMenu.innerHTML = `
    <button class="clerk-avatar-btn" id="clerkAvatarBtn" title="${user.firstName || 'My Account'}">
      ${user.imageUrl
        ? `<img src="${user.imageUrl}" alt="Profile" class="clerk-avatar-img">`
        : `<div class="clerk-avatar-initials">${getInitials(user)}</div>`
      }
    </button>
    <div class="clerk-dropdown" id="clerkDropdown">
      <div class="clerk-dropdown-user">
        <strong>${user.firstName || ''} ${user.lastName || ''}</strong>
        <span>${user.emailAddresses?.[0]?.emailAddress || ''}</span>
      </div>
      <div class="clerk-dropdown-divider"></div>
      <a href="orders.html" class="clerk-dropdown-item">
        <i class="fa-solid fa-box"></i> My Orders
      </a>
      <button class="clerk-dropdown-item clerk-signout-btn" id="clerkSignOutBtn">
        <i class="fa-solid fa-right-from-bracket"></i> Sign Out
      </button>
    </div>
  `;

  userAnchor.replaceWith(userMenu);

  // Toggle dropdown
  document.getElementById('clerkAvatarBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('clerkDropdown').classList.toggle('open');
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    const dd = document.getElementById('clerkDropdown');
    if (dd) dd.classList.remove('open');
  });

  // Sign out
  document.getElementById('clerkSignOutBtn').addEventListener('click', async () => {
    await Clerk.signOut();
    window.location.reload();
  });
}

function renderLoggedOutHeader(container) {
  const userAnchor = container.querySelector('a[title="Sign In"]');
  if (!userAnchor) return;

  userAnchor.addEventListener('click', async (e) => {
    e.preventDefault();
    await openSignInModal();
  });

  // Update the icon title to be more descriptive
  userAnchor.setAttribute('title', 'Sign In / Register');
}

// ── SIGN IN / SIGN UP MODAL ───────────────────────────────────
// Clerk renders its own UI inside our modal wrapper

async function openSignInModal(redirectAfter = null) {
  // Store redirect URL if buyer clicked "Add to Cart" while logged out
  if (redirectAfter) {
    sessionStorage.setItem('clerk_redirect_after', redirectAfter);
  }

  try {
    await ensureClerkLoaded();
  } catch (error) {
    console.error('Unable to open Clerk sign-in:', error);
    return;
  }

  const modal = document.getElementById('clerkAuthModal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.style.overflow = '';

  Clerk.openSignIn(getSignInProps());
}

function closeAuthModal() {
  if (window.Clerk && typeof Clerk.closeSignIn === 'function') {
    Clerk.closeSignIn();
  }

  const modal = document.getElementById('clerkAuthModal');
  if (modal) {
    modal.classList.remove('active');
  }

  document.body.style.overflow = '';
}

function createAuthModal() {
  const modal = document.createElement('div');
  modal.id = 'clerkAuthModal';
  modal.className = 'clerk-auth-modal';
  modal.innerHTML = `
    <div class="clerk-auth-overlay" id="clerkAuthOverlay"></div>
    <div class="clerk-auth-inner">
      <button class="clerk-auth-close" id="clerkAuthClose">✕</button>
      <div id="clerkMountPoint"></div>
    </div>
  `;

  // Close on overlay click
  modal.querySelector('#clerkAuthOverlay').addEventListener('click', closeAuthModal);
  modal.querySelector('#clerkAuthClose').addEventListener('click', closeAuthModal);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAuthModal();
  });

  return modal;
}

// ── CART PROTECTION ───────────────────────────────────────────
// Intercepts "Proceed to Checkout" if user is not logged in

function initCartProtection() {
  // Attach to checkout button inside cart drawer
  const checkoutBtn = document.querySelector('.btn-checkout');
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener('click', (e) => {
    if (!Clerk.user) {
      e.preventDefault();
      closeCart();                                // close cart drawer first
      openSignInModal(checkoutBtn.href || 'checkout.html');  // then open sign-in
    }
    // if logged in — href navigates normally
  });
}

// ── ADD TO CART PROTECTION ────────────────────────────────────
// Call this from your addToCart() function to check auth first
// Returns true if user can proceed, false if they need to sign in

function requireAuthForCart(bookId, title, img, price) {
  if (Clerk.user) {
    // User is logged in — proceed with adding to cart
    addToCart(bookId, title, img, price);
  } else {
    // Not logged in — open sign in modal
    // After sign-in, the page reloads and cart state from sessionStorage is restored
    sessionStorage.setItem('pendingCartItem', JSON.stringify({ bookId, title, img, price }));
    openSignInModal();
  }
}

// ── RESTORE PENDING CART ITEM AFTER SIGN IN ───────────────────
// Called on page load if user just signed in

function restorePendingCartItem() {
  const pending = sessionStorage.getItem('pendingCartItem');
  if (pending && Clerk.user) {
    try {
      const { bookId, title, img, price } = JSON.parse(pending);
      sessionStorage.removeItem('pendingCartItem');
      addToCart(bookId, title, img, price);
    } catch (e) {
      sessionStorage.removeItem('pendingCartItem');
    }
  }
}

// ── UTILITY ───────────────────────────────────────────────────
function getInitials(user) {
  const first = (user.firstName || '')[0] || '';
  const last  = (user.lastName  || '')[0] || '';
  return (first + last).toUpperCase() || '?';
}

// ── EXPOSE GLOBALLY ───────────────────────────────────────────
window.openSignInModal    = openSignInModal;
window.closeAuthModal     = closeAuthModal;
window.requireAuthForCart = requireAuthForCart;

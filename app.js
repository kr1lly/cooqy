const authMessage = document.getElementById('auth-message');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const userNameTarget = document.getElementById('user-name');
const userEmailTarget = document.getElementById('user-email');
const profileImage = document.getElementById('profile-image');
const profileFallback = document.getElementById('profile-fallback');
const profileUpload = document.getElementById('profile-upload');
const profileMenuButton = document.getElementById('profile-menu-button');
const profileMenu = document.getElementById('profile-menu');
const profileMenuLinks = document.querySelectorAll('.profile-menu-link');
const profileAccessory = document.getElementById('profile-accessory');
const shopSection = document.getElementById('shop');
const siteMenuButton = document.getElementById('site-menu-button');
const siteMenu = document.getElementById('site-menu');
const shopButtons = document.querySelectorAll('.shop-action');
const shopNote = document.getElementById('shop-note');
const premiumDishCards = document.querySelectorAll('[data-premium-dish="true"]');
const premiumDishOverlays = document.querySelectorAll('.premium-dish-overlay');

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('cooqyUsers') || '[]');
  } catch (error) {
    localStorage.removeItem('cooqyUsers');
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem('cooqyUsers', JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem('cooqyCurrentUser', JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem('cooqyCurrentUser') || 'null');
  } catch (error) {
    localStorage.removeItem('cooqyCurrentUser');
    return null;
  }
}

function getProfileStorageKey(email) {
  return `cooqyProfileImage:${email}`;
}

function getStoredProfileImage(email) {
  return localStorage.getItem(getProfileStorageKey(email));
}

function saveStoredProfileImage(email, imageData) {
  localStorage.setItem(getProfileStorageKey(email), imageData);
}

function getAccessoryStorageKey(email) {
  return `cooqyAccessory:${email}`;
}

function getUnlockedAccessoriesKey(email) {
  return `cooqyUnlockedAccessories:${email}`;
}

function getSelectedAccessory(email) {
  try {
    return JSON.parse(localStorage.getItem(getAccessoryStorageKey(email)) || 'null');
  } catch (error) {
    localStorage.removeItem(getAccessoryStorageKey(email));
    return null;
  }
}

function saveSelectedAccessory(email, accessory) {
  localStorage.setItem(getAccessoryStorageKey(email), JSON.stringify(accessory));
}

function getUnlockedAccessories(email) {
  try {
    return JSON.parse(localStorage.getItem(getUnlockedAccessoriesKey(email)) || '[]');
  } catch (error) {
    localStorage.removeItem(getUnlockedAccessoriesKey(email));
    return [];
  }
}

function saveUnlockedAccessories(email, accessories) {
  localStorage.setItem(getUnlockedAccessoriesKey(email), JSON.stringify(accessories));
}

function getSubscriptionStorageKey(email) {
  return `cooqySubscription:${email}`;
}

function getSubscription(email) {
  return JSON.parse(localStorage.getItem(getSubscriptionStorageKey(email)) || 'null');
}

function saveSubscription(email, subscription) {
  localStorage.setItem(getSubscriptionStorageKey(email), JSON.stringify(subscription));
}

function slugifyDishName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getAdUnlockStorageKey(email) {
  return `cooqyAdUnlocks:${email}`;
}

function getAdUnlocks(email) {
  try {
    return JSON.parse(localStorage.getItem(getAdUnlockStorageKey(email)) || '[]');
  } catch (error) {
    localStorage.removeItem(getAdUnlockStorageKey(email));
    return [];
  }
}

function saveAdUnlocks(email, unlocks) {
  localStorage.setItem(getAdUnlockStorageKey(email), JSON.stringify(unlocks));
}

function showMessage(message, isError = false) {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.style.color = isError ? '#c2410c' : 'var(--cooqy-orange)';
}

function getPageUrl(pageName) {
  return new URL(pageName, window.location.href).href;
}

function goToDishesPage() {
  window.location.assign(getPageUrl('dishes.html'));
}

function goToLandingPage() {
  window.location.assign(getPageUrl('index.html'));
}

function handleSignup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = formData.get('name').toString().trim();
  const email = formData.get('email').toString().trim().toLowerCase();
  const password = formData.get('password').toString();
  const users = getStoredUsers();

  if (users.some((user) => user.email === email)) {
    showMessage('That email is already registered. Try logging in instead.', true);
    return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveStoredUsers(users);
  setSession({ name, email });
  showMessage('Account created. Taking you to your dishes now.');
  form.reset();
  goToDishesPage();
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = formData.get('email').toString().trim().toLowerCase();
  const password = formData.get('password').toString();
  const users = getStoredUsers();
  const match = users.find((user) => user.email === email && user.password === password);

  if (!match) {
    showMessage('We could not match that email and password.', true);
    return;
  }

  setSession({ name: match.name, email: match.email });
  showMessage('Welcome back. Loading your dishes.');
  form.reset();
  goToDishesPage();
}

function renderProfile(session) {
  if (!session || !profileImage || !profileFallback) return;

  const initialsSource = (session.name || session.email || 'C').trim();
  const initials = initialsSource.slice(0, 1).toUpperCase();
  const savedImage = getStoredProfileImage(session.email);
  const selectedAccessory = getSelectedAccessory(session.email);

  profileFallback.textContent = initials;

  if (profileAccessory) {
    if (selectedAccessory && selectedAccessory.symbol) {
      profileAccessory.textContent = selectedAccessory.symbol;
      profileAccessory.dataset.accessoryType = selectedAccessory.id || '';
      profileAccessory.style.display = 'block';
    } else {
      profileAccessory.textContent = '';
      delete profileAccessory.dataset.accessoryType;
      profileAccessory.style.display = 'none';
    }
  }

  if (savedImage) {
    profileImage.src = savedImage;
    profileImage.style.display = 'block';
    profileFallback.style.display = 'none';
    return;
  }

  profileImage.removeAttribute('src');
  profileImage.style.display = 'none';
  profileFallback.style.display = 'flex';
}

function updateShopButtons(session) {
  if (!session || !shopButtons.length) return;

  const unlocked = getUnlockedAccessories(session.email);
  const selected = getSelectedAccessory(session.email);
  const subscription = getSubscription(session.email);

  shopButtons.forEach((button) => {
    if (button.dataset.subscription) {
      button.textContent = subscription ? 'Subscribed' : 'Subscribe';
      return;
    }

    const accessoryId = button.dataset.accessory;
    const accessoryName = button.dataset.name || 'Mesh';
    const isUnlocked = unlocked.some((item) => item.id === accessoryId);
    const isSelected = selected && selected.id === accessoryId;

    if (isSelected) {
      button.textContent = 'Equipped';
      return;
    }

    if (isUnlocked) {
      button.textContent = `Use ${accessoryName}`;
      return;
    }

    button.textContent = 'Pay PHP 150';
  });
}

function updatePremiumDishes(session) {
  if (!premiumDishCards.length) return;

  const subscription = session ? getSubscription(session.email) : null;
  const adUnlocks = session ? getAdUnlocks(session.email) : [];
  const hasCooqyPlus = Boolean(subscription && subscription.active);

  premiumDishCards.forEach((card) => {
    const dishId = card.dataset.dishId || '';
    const unlockedByAds = adUnlocks.includes(dishId);
    card.classList.toggle('is-locked', !(hasCooqyPlus || unlockedByAds));
  });
}

function initializePremiumDishActions() {
  if (!premiumDishCards.length) return;

  premiumDishCards.forEach((card) => {
    const title = card.querySelector('h3');
    const overlay = card.querySelector('.premium-dish-overlay');
    if (!overlay || !title) return;

    if (!card.dataset.dishId) {
      card.dataset.dishId = slugifyDishName(title.textContent.trim());
    }

    const overlayText = overlay.querySelector('span');
    if (overlayText) {
      overlayText.textContent = 'Watch ads to unlock this dish.';
    }

    let button = overlay.querySelector('.watch-ad-button');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'watch-ad-button';
      button.textContent = 'Watch Ads to Unlock';
      overlay.appendChild(button);
    }

    button.dataset.dishId = card.dataset.dishId;
    button.dataset.dishName = title.textContent.trim();
  });
}

function handleWatchAdUnlock(event) {
  const session = getSession();
  const button = event.currentTarget;
  if (!session || !button) return;

  const dishId = button.dataset.dishId;
  const dishName = button.dataset.dishName || 'this dish';
  const currentUnlocks = getAdUnlocks(session.email);

  if (currentUnlocks.includes(dishId)) {
    updatePremiumDishes(session);
    return;
  }

  const approved = window.confirm(`Play a dummy ad to unlock ${dishName}?`);
  if (!approved) return;

  currentUnlocks.push(dishId);
  saveAdUnlocks(session.email, currentUnlocks);
  updatePremiumDishes(session);

  if (shopNote) {
    shopNote.textContent = `${dishName} has been unlocked with a dummy ad.`;
  }
}

function protectDishesPage() {
  if (!document.body.dataset.page || document.body.dataset.page !== 'dishes') return;

  const session = getSession();
  if (!session) {
    window.location.replace(`${getPageUrl('index.html')}#auth`);
    return;
  }

  if (userNameTarget) userNameTarget.textContent = session.name;
  if (userEmailTarget) userEmailTarget.textContent = session.email;
  renderProfile(session);
  updateShopButtons(session);
  updatePremiumDishes(session);
}

function handleLogout() {
  localStorage.removeItem('cooqyCurrentUser');
  goToLandingPage();
}

function toggleProfileMenu() {
  if (!profileMenu || !profileMenuButton) return;

  const isHidden = profileMenu.hasAttribute('hidden');
  if (isHidden) {
    profileMenu.removeAttribute('hidden');
    profileMenuButton.setAttribute('aria-expanded', 'true');
    return;
  }

  profileMenu.setAttribute('hidden', '');
  profileMenuButton.setAttribute('aria-expanded', 'false');
}

function toggleSiteMenu() {
  if (!siteMenu || !siteMenuButton) return;

  const isHidden = siteMenu.hasAttribute('hidden');
  if (isHidden) {
    siteMenu.removeAttribute('hidden');
    siteMenuButton.setAttribute('aria-expanded', 'true');
    return;
  }

  siteMenu.setAttribute('hidden', '');
  siteMenuButton.setAttribute('aria-expanded', 'false');
}

function handleProfileMenuOutsideClick(event) {
  if (!profileMenu || !profileMenuButton) return;
  if (profileMenu.hasAttribute('hidden')) return;
  if (profileMenu.contains(event.target) || profileMenuButton.contains(event.target)) return;

  profileMenu.setAttribute('hidden', '');
  profileMenuButton.setAttribute('aria-expanded', 'false');
}

function handleSiteMenuOutsideClick(event) {
  if (!siteMenu || !siteMenuButton) return;
  if (siteMenu.hasAttribute('hidden')) return;
  if (siteMenu.contains(event.target) || siteMenuButton.contains(event.target)) return;

  siteMenu.setAttribute('hidden', '');
  siteMenuButton.setAttribute('aria-expanded', 'false');
}

function handleProfileUpload(event) {
  const session = getSession();
  const file = event.target.files && event.target.files[0];

  if (!session || !file) return;

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    if (typeof reader.result !== 'string') return;
    saveStoredProfileImage(session.email, reader.result);
    renderProfile(session);
  });
  reader.readAsDataURL(file);
}

function handleShopPurchase(event) {
  const session = getSession();
  const button = event.currentTarget;

  if (!session || !button) return;

  if (button.dataset.subscription) {
    const existingSubscription = getSubscription(session.email);
    if (existingSubscription) {
      if (shopNote) {
        shopNote.textContent = 'Cooqy+ is already active on this account.';
      }
      updateShopButtons(session);
      return;
    }

    const subscriptionName = button.dataset.name || 'Cooqy+';
    const subscriptionPrice = button.dataset.price || '300';
    const approved = window.confirm(`Proceed with demo subscription to ${subscriptionName} for PHP ${subscriptionPrice}?`);
    if (!approved) return;

    saveSubscription(session.email, {
      id: button.dataset.subscription,
      name: subscriptionName,
      price: subscriptionPrice,
      active: true
    });
    updateShopButtons(session);

    if (shopNote) {
      shopNote.textContent = `${subscriptionName} is now active on your account.`;
    }
    return;
  }

  const accessory = {
    id: button.dataset.accessory,
    symbol: button.dataset.symbol,
    name: button.dataset.name
  };

  const unlocked = getUnlockedAccessories(session.email);
  const alreadyUnlocked = unlocked.some((item) => item.id === accessory.id);

  if (!alreadyUnlocked) {
    const approved = window.confirm(`Proceed with demo checkout for ${accessory.name} at PHP 150?`);
    if (!approved) return;

    unlocked.push(accessory);
    saveUnlockedAccessories(session.email, unlocked);
  }

  saveSelectedAccessory(session.email, accessory);
  renderProfile(session);
  updateShopButtons(session);

  if (shopNote) {
    shopNote.textContent = `${accessory.name} is now active on your profile.`;
  }
}

function openShopSection() {
  if (!shopSection) return;

  shopSection.hidden = false;
  shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleProfileMenuLinkClick(event) {
  const link = event.currentTarget;
  if (!profileMenu || !profileMenuButton) return;

  profileMenu.setAttribute('hidden', '');
  profileMenuButton.setAttribute('aria-expanded', 'false');

  if (link.getAttribute('href') === '#shop') {
    event.preventDefault();
    openShopSection();
  }
}

function syncLandingPageSession() {
  if (document.body.dataset.page === 'dishes') return;

  const session = getSession();
  if (!session || !authMessage) return;

  authMessage.textContent = `${session.name}, you're already logged in.`;
  authMessage.style.color = 'var(--cooqy-orange)';
}

if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

if (logoutButton) {
  logoutButton.addEventListener('click', handleLogout);
}

if (profileMenuButton) {
  profileMenuButton.addEventListener('click', toggleProfileMenu);
}

if (profileMenuLinks.length) {
  profileMenuLinks.forEach((link) => {
    link.addEventListener('click', handleProfileMenuLinkClick);
  });
}

if (siteMenuButton) {
  siteMenuButton.addEventListener('click', toggleSiteMenu);
}

if (profileUpload) {
  profileUpload.addEventListener('change', handleProfileUpload);
}

if (shopButtons.length) {
  shopButtons.forEach((button) => button.addEventListener('click', handleShopPurchase));
}

document.addEventListener('click', handleProfileMenuOutsideClick);
document.addEventListener('click', handleSiteMenuOutsideClick);

initializePremiumDishActions();
if (premiumDishOverlays.length) {
  premiumDishOverlays.forEach((overlay) => {
    const button = overlay.querySelector('.watch-ad-button');
    if (button) {
      button.addEventListener('click', handleWatchAdUnlock);
    }
  });
}

protectDishesPage();
syncLandingPageSession();

const themeSwitcher = document.getElementById('theme-switcher');

// Load saved theme
if (localStorage.getItem('darkmode') === 'active') {
  document.body.classList.add('darkmode');
}

// Toggle dark mode on click
themeSwitcher.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('darkmode');
  localStorage.setItem('darkmode', isDark ? 'active' : 'inactive');
});
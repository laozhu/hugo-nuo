// Selected DOM elements
const html = document.querySelector('html');
const body = document.querySelector('body');
const menuToggle = document.querySelector('.menu-toggle');
const menuIcon = document.querySelector('.icon-menu');
const siteMenu = document.querySelector('.site-menu');
const socialMenu = document.querySelector('.social-menu');
const toTopBtn = document.querySelector('.to-top');

// Site and social menu toggle
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    siteMenu.classList.toggle('collapsed');
    socialMenu.classList.toggle('collapsed');
    menuIcon.classList.toggle('icon-menu');
    menuIcon.classList.toggle('icon-close');
  });
}

// Random emoji for 404 error message.
const randomErrorEmoji = () => {
  const error = document.getElementsByClassName('error-emoji')[0];
  const emojiArray = [
    '\\(o_o)/', '(o^^)o', '(˚Δ˚)b', '(^-^*)', '(≥o≤)', '(^_^)b', '(·_·)',
    '(=\'X\'=)', '(>_<)', '(;-;)', '\\(^Д^)/',
  ];
  if (error) {
    const errorEmoji = emojiArray[Math.floor(Math.random() * emojiArray.length)];
    error.appendChild(document.createTextNode(errorEmoji));
  }
};
randomErrorEmoji();

// Object-fit polyfill for post cover
/* eslint-disable no-undef */
objectFitImages('img.post-cover');

// Show toTopBtn when scroll to 600px
/* eslint-disable no-undef */
let lastPosition = 0;
let ticking = false;
window.addEventListener('scroll', () => {
  lastPosition = body.scrollTop === 0 ? html.scrollTop : body.scrollTop;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (lastPosition >= 600) {
        toTopBtn.classList.remove('is-hide');
      } else {
        toTopBtn.classList.add('is-hide');
      }
      ticking = false;
    });
  }
  ticking = true;
});

// Smooth Scroll to top when click toTopBtn
const scroll = new SmoothScroll('a[href*="#"]');
toTopBtn.addEventListener('click', () => {
  scroll.animateScroll(0);
});

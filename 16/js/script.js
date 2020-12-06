'use strict';

const header = document.querySelector('.header');
const nav = header.querySelector('.header__nav');
const navToggle = nav.querySelector('.header__nav-toggle');

header.classList.remove('header--no-js');

navToggle.addEventListener('click', (evt) => {
  evt.preventDefault();

  nav.classList.toggle('header__nav--open');

  let expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', !expanded);
});

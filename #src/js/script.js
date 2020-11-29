'use string';

import date from './modules/date';
import scrollTo from './modules/scroll-to';

window.addEventListener('DOMContentLoaded', () => {
    date('.footer__date');
    scrollTo('a.scroll-to');

});
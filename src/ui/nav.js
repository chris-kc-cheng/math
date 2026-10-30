import {mountCalculator} from '../calculator/view.js';
import {mountProfileCorner} from './profile-corner.js';
// One grouped page switcher shared by every page; the current page is highlighted.
const pages=[['demo','Demo','./'],['curriculum','Curriculum','./curriculum.html'],['game','Practice','./game.html']];
export const pageNav=current=>{queueMicrotask(mountCalculator);queueMicrotask(mountProfileCorner);return `<nav class="page-nav" aria-label="Pages">${pages.map(([id,label,href])=>`<a href="${href}"${id===current?' aria-current="page"':''}>${label}</a>`).join('')}</nav>`;};

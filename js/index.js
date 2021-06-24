import { ChatNotificationSettings, moduleName, maxMessages, fadeOutDelay } from './settings.js';
import { TweenMax } from '../../../../scripts/greensock/esm/gsap-core.js';

function expandSideBarInstant(sideBar) {
  sideBar.classList.remove('collapsed');
  sideBar.style.width = "";
  sideBar.style.height = "";
  ui.sidebar._collapsed = false;
  const icon = sideBar.querySelector('#sidebar-tabs a.collapse i');
  icon.classList.remove('fa-caret-left');
  icon.classList.add('fa-caret-right');
  Hooks.callAll('sidebarCollapse', ui.sidebar, ui.sidebar._collpased);
}

function findTarget(card, ev, messageId) {

  const cardRect = card.getBoundingClientRect();
  const popupRect = document.querySelector(`.${moduleName}`).getBoundingClientRect();
  let x = ev.clientX - popupRect.left + cardRect.left,
      y = ev.clientY - popupRect.top + cardRect.top;

  let target = document.elementFromPoint(x,y);

  if (target && target.closest('.message')?.dataset.messageId === messageId) return {target,x , y};
  const targetRect = ev.target.getBoundingClientRect();
  // If click element is obscured, rasterize the target and test if some point is free
  // doing 10 steps in each direction, with a minimum of 5 px is some arbitrary number chosen, but i think its quite okayish in regards of accuracy and performance
  const dx = Math.min(targetRect.width / 10, 5);
  const dy = Math.min(targetRect.height / 10, 5);
  for (let vert = targetRect.top + 1; vert < targetRect.bottom; vert += dy) {
    y = vert - popupRect.top + cardRect.top;
    for (let hor = targetRect.left + 1; hor < targetRect.right; hor += dx) {
      x = hor - popupRect.left + cardRect.left;
      target = document.elementFromPoint(x,y)

      if (target && target.closest('.message')?.dataset.messageId === messageId) return {target, x, y};
    }
  }

  return {target: null, x, y};
}

function delegateEvent(node, ev) {
  const card = document.getElementById('chat-log').querySelector(`[data-message-id="${node.dataset.messageId}"]`);
  // Card not found? strange.. just return
  if (!card) return;
  card.scrollIntoView();
  // Get target element on "real" chat-card
  const {target, x, y} = findTarget(card, ev, node.dataset.messageId);

  if (!target) return;
  // If for some reason wrong one was found.. just do nothing
  const event = new MouseEvent(ev.type, {
    bubbles: true, 
    canceable: true, 
    shiftKey: ev.shiftKey, 
    metaKey: ev.metaKey, 
    ctrlKey: ev.ctrlKey,
    clientX: x,
    clientY: y
  });
  target.dispatchEvent(event);
}

function handleMouseEvent(ev) {
  const node = ev.target.closest('.message');
  if (!node) return;
  // activate chat
  const tabBtn = document.getElementById('sidebar-tabs').children[0];
  if (!tabBtn.classList.contains('active')) 
    tabBtn.dispatchEvent(new MouseEvent('click', {bubbles: true, canceable: true}));

  const sideBar = tabBtn.closest('#sidebar');
  if (sideBar.classList.contains('collapsed')) expandSideBarInstant(sideBar);
  delegateEvent(node, ev);
  node.remove();

}

function addMessage(node) {
  const div = document.querySelector(`.${moduleName}`);
  const messageId = node.dataset.messageId;

  const oldNode = div.querySelector(`[data-message-id="${messageId}"]`);
  if (oldNode) return updateMessage(node, oldNode);
  if (div.children.length >= maxMessages) div.firstElementChild.remove();

  div.appendChild(node);
  TweenMax.from(node, 0.3, {height: 0, onComplete: () => {
      node.style.height = "";
      removeMessage(node);
    }
  });
}

function updateMessage(newNode, oldNode) {
  oldNode.parentNode?.replaceChild(newNode, oldNode);
  removeMessage(newNode);
}

function removeMessage(node, {time = 0.3, delay = fadeOutDelay}={}) {
  if (fadeOutDelay < 0) return;
  TweenMax.to(node, time, {opacity: 0, height: 0, delay, onComplete: () => {
    node.remove();
  }});
}

Hooks.on('renderChatLog', async (app, html) => {
	if (document.body.classList.contains('stream')) return;

  const chatTab = html[0];
  const div = document.body.appendChild(html[0].querySelector('#chat-log').cloneNode(false));
  div.classList.add(moduleName);

  div.addEventListener('click', (ev) => {
    handleMouseEvent(ev);
  });
  div.addEventListener('contextmenu', (ev) => {
    handleMouseEvent(ev);
  });

  Hooks.on('renderChatMessage', (app, html, options) => {
    if (chatTab.classList.contains('active') && !chatTab.closest('#sidebar').classList.contains('collapsed')) return;
    const newNode = html[0].cloneNode(true);
    addMessage(newNode);
	});
	

  ChatNotificationSettings.init();
});
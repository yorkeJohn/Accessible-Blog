/* helpers.js */

const getItem = (key) => window.localStorage.getItem(key)
const setItem = (key, val) => window.localStorage.setItem(key, val)

const notify = (selector) => {
  $(selector).addClass('notification-show')
  setTimeout(() => $(selector).removeClass('notification-show'), 4250)
}

const redirectRel = (path) => location.pathname = path
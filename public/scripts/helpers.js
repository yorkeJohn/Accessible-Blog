const getItem = (key) => window.localStorage.getItem(key)
const setItem = (key, val) => window.localStorage.setItem(key, val)

const displayTooltip = (selector, timeout) => {
  $(selector).show()
  setTimeout(() => $(selector).hide(), timeout)
}

const redirectRel = (path) => location.pathname = path
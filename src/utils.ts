/**
 * Returns an array with all descendant elements (even deeply nested ones)
 * of a given ancestor.
 */
export function getAllDescendantElements(ancestor: Element) {
  return Array.from(ancestor.getElementsByTagName('*'))
}

/**
 * Asserts that a given argument is a keyboard-focusable element.
 */
export function isKeyboardFocusable(arg: unknown): arg is HTMLElement {
  if (arg instanceof HTMLElement) {
    const element = arg

    if (element.matches('[disabled], [hidden]')) return false

    return element.tabIndex >= 0
  }

  return false
}

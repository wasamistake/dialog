import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { DialogContext } from './index.context'
import { getAllDescendantElements, isKeyboardFocusable } from './utils'

type CloseCallback = () => void

type ActiveElement = Element | null

/**
 * A mapping between each dialog, its 'close' callback, and
 * the focused element before its mount.
 */
const dialogStack = new Map<HTMLDivElement, [CloseCallback, ActiveElement]>()

export type DialogRef = React.MutableRefObject<HTMLDivElement | null>

type DialogProps = {
  children: React.ReactNode
  /**
   * A function that should trigger the dialog close.
   */
  close: () => void
  /**
   * Whether the dialog should close whenever there is
   * a click outside of it.
   * @default true
   */
  closeOnClickOutside?: boolean
  /**
   * Where to render the dialog. By default, it gets appended
   * to the body element.
   * @default document.body
   */
  container?: Element | DocumentFragment | null
  /**
   * The initial dialog state. Either opened (true) or closed (false).
   */
  opened: boolean
  /**
   * A ref object that points to the element that will
   * receive focus on dialog close. Falls back to the last active element
   * if none is specified.
   */
  placeFinalFocusAt?: React.RefObject<HTMLElement>
}

/**
 * A dialog is a window overlaid on either the primary window
 * or another dialog window.
 * @see{@link https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/}
 */
export function Dialog(props: DialogProps) {
  const {
    children,
    close,
    closeOnClickOutside = true,
    container,
    opened,
    placeFinalFocusAt,
  } = props

  const dialogRef: DialogRef = useRef(null)

  // Handles the dialog stack.
  useEffect(() => {
    if (dialogRef.current === null) return

    dialogStack.set(dialogRef.current, [close, document.activeElement])

    // Syncs with the DOM.
    Array.from(dialogStack.keys()).forEach(dialog => {
      if (!document.contains(dialog)) {
        dialogStack.delete(dialog)
      }
    })
  }, [close])

  // Handles initial focus placement.
  useEffect(() => {
    if (!opened || dialogRef.current === null) return

    const dialog = dialogRef.current

    const explicitInitialFocusTarget =
      dialog.querySelector('[data-place-focus]')

    if (
      isKeyboardFocusable(explicitInitialFocusTarget) ||
      (explicitInitialFocusTarget instanceof HTMLElement &&
        // Checking for `element.tabIndex` instead of `element.getAttribute`
        // would not work as -1 is the default value, resulting in `if(true)`.
        explicitInitialFocusTarget.getAttribute('tabindex') === '-1')
    ) {
      explicitInitialFocusTarget.focus()
      return
    }

    const implicitInitialFocusTarget =
      getAllDescendantElements(dialog).find(isKeyboardFocusable)

    if (implicitInitialFocusTarget) {
      implicitInitialFocusTarget.focus()
      return
    }

    console.error(
      "Couldn't find any focusable element. It's strongly recommended that a dialog includes at least a button that closes it.",
    )
  }, [opened])

  // Handles final focus placement.
  useEffect(() => {
    if (!opened) return

    const uppermostDialogTuple = Array.from(dialogStack.values()).at(-1)
    const activeElementBeforeDialogMount = uppermostDialogTuple?.[1]

    const finalFocusTarget = placeFinalFocusAt?.current
      ? placeFinalFocusAt.current
      : activeElementBeforeDialogMount

    return () => {
      if (isKeyboardFocusable(finalFocusTarget)) {
        finalFocusTarget.focus()
      }
    }
  }, [opened, placeFinalFocusAt])

  // Handles focus trapping.
  useEffect(() => {
    if (!opened || dialogRef.current === null) return

    const dialog = dialogRef.current

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements =
        getAllDescendantElements(dialog).filter(isKeyboardFocusable)

      const firstFocusableElement = focusableElements[0]
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1]

      if (!e.shiftKey) {
        if (
          document.activeElement === lastFocusableElement ||
          // Prevents focus from leaving the dialog, e.g., by clicking or
          // selecting a non-interactive element and
          // hitting Tab or Shift + Tab.
          // The current behavior is to place it back on the edges, but
          // a future implementation might place it back
          // on the last active element instead.
          document.activeElement === dialog
        ) {
          firstFocusableElement.focus()
          e.preventDefault()
        }
      }

      if (e.shiftKey) {
        if (
          document.activeElement === firstFocusableElement ||
          document.activeElement === dialog
        ) {
          lastFocusableElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => document.removeEventListener('keydown', trapFocus)
  }, [opened])

  // Handles ESC key.
  useEffect(() => {
    const closeDialog = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const uppermostDialogTuple = Array.from(dialogStack.values()).at(-1)
        const uppermostDialogCloseCallback = uppermostDialogTuple?.[0]

        if (uppermostDialogCloseCallback === close) {
          close()
        }
      }
    }

    document.addEventListener('keydown', closeDialog)
    return () => document.removeEventListener('keydown', closeDialog)
  }, [close])

  // Handles click outside.
  useEffect(() => {
    if (!closeOnClickOutside || dialogRef.current === null) return

    const dialog = dialogRef.current

    const closeDialog = (e: MouseEvent) => {
      const eTarget = e.target

      if (eTarget instanceof Node) {
        if (!dialog.contains(eTarget)) {
          const uppermostDialogTuple = Array.from(dialogStack.values()).at(-1)
          const uppermostDialogCloseCallback = uppermostDialogTuple?.[0]

          if (uppermostDialogCloseCallback === close) {
            close()
          }
        }
      }
    }

    document.addEventListener('click', closeDialog, true)
    return () => document.removeEventListener('click', closeDialog, true)
  }, [close, closeOnClickOutside])

  if (!opened) return null

  return ReactDOM.createPortal(
    <DialogContext.Provider value={{ dialogRef }}>
      {children}
    </DialogContext.Provider>,
    container ?? document.body,
  )
}

export { Backdrop, Body } from './parts'

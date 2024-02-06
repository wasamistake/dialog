import React, { useRef, useState } from 'react'
import { afterEach, expect, describe, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, Backdrop, Body } from '.'

afterEach(() => {
  vi.restoreAllMocks()
})

test('Element attributes are forwarded', () => {
  render(
    <Dialog opened close={() => {}}>
      <Backdrop data-testid=''>
        <Body aria-label='A dialog' data-testid=''>
          <button>Close dialog</button>
        </Body>
      </Backdrop>
    </Dialog>,
  )

  const elements = screen.getAllByTestId('')
  expect(elements).toHaveLength(2)
})

test('The dialog can be rendered at a custom location', () => {
  const mountTarget = document.createElement('div')
  mountTarget.id = 'mount-target'

  const { rerender } = render(
    <Dialog opened close={() => {}}>
      <Body aria-label='A dialog'>
        <button>Close dialog</button>
      </Body>
    </Dialog>,
    { container: document.body.appendChild(mountTarget) },
  )

  expect(document.body).toContainElement(screen.getByRole('dialog'))
  expect(mountTarget).not.toContainElement(screen.getByRole('dialog'))

  rerender(
    <Dialog opened close={() => {}} container='#mount-target'>
      <Body aria-label='A dialog'>
        <button>Close dialog</button>
      </Body>
    </Dialog>,
  )

  expect(mountTarget).toContainElement(screen.getByRole('dialog'))
})

test('Clicking outside is handled', async () => {
  const user = userEvent.setup()

  const { rerender } = render(<ExampleDialog />)

  const openButton = screen.getByRole('button', { name: /open/i })

  // When 'closeOnClickOutside' is enabled.
  await user.click(openButton)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByTestId('backdrop'))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  rerender(<ExampleDialog closeOnClickOutside={false} />)
  // When 'closeOnClickOutside' is disabled.
  await user.click(openButton)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByTestId('backdrop'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('Nested dialogs are handled', async () => {
  const user = userEvent.setup()

  const { rerender } = render(<NestedDialogs />)

  await user.click(screen.getByRole('button', { name: /open 1st/i }))
  await user.click(screen.getByRole('button', { name: /open 2nd/i }))
  await user.click(screen.getByRole('button', { name: /open 3rd/i }))

  // Now that all three dialogs are opened, close them in three different ways.

  await user.click(screen.getByRole('button', { name: /close 3rd/i }))
  expect(
    screen.queryByRole('heading', { level: 2, name: /3rd dialog/i }),
  ).not.toBeInTheDocument()

  await user.keyboard('{Escape}')
  expect(
    screen.queryByRole('heading', { level: 2, name: /2nd dialog/i }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByTestId('backdrop'))
  expect(
    screen.queryByRole('heading', { level: 2, name: /1st dialog/i }),
  ).not.toBeInTheDocument()

  rerender(<NestedDialogs />)

  // Ensures that nested dialogs can be operated with the keyboard.

  const openButton1 = screen.getByRole('button', { name: /open 1st/i })
  expect(openButton1).toHaveFocus()
  await user.keyboard('{Enter}')

  const openButton2 = screen.getByRole('button', { name: /open 2nd/i })
  expect(openButton2).toHaveFocus()
  await user.keyboard(' ')

  const openButton3 = screen.getByRole('button', { name: /open 3rd/i })
  expect(openButton3).toHaveFocus()
  await user.keyboard('{Enter}')

  const closeButton3 = screen.getByRole('button', { name: /close 3rd/i })
  expect(closeButton3).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(
    screen.queryByRole('heading', { level: 2, name: /3rd dialog/i }),
  ).not.toBeInTheDocument()

  const closeButton2 = screen.getByRole('button', { name: /close 2nd/i })
  await user.tab()
  expect(closeButton2).toHaveFocus()
  await user.keyboard(' ')
  expect(
    screen.queryByRole('heading', { level: 2, name: /2nd dialog/i }),
  ).not.toBeInTheDocument()

  const closeButton1 = screen.getByRole('button', { name: /close 1st/i })
  await user.tab()
  expect(closeButton1).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(
    screen.queryByRole('heading', { level: 2, name: /1st dialog/i }),
  ).not.toBeInTheDocument()
})

test("The dialog doesn't leak focus when a non-interactive element is selected or clicked inside of it", async () => {
  const user = userEvent.setup()

  render(<ExampleDialog />)

  const openButton = screen.getByRole('button', { name: /open/i })
  await user.click(openButton)

  const dialog = screen.getByRole('dialog')
  const link = screen.getByRole('link')
  const closeButton = screen.getByRole('button', { name: /close/i })

  expect(link).toHaveFocus()

  await user.click(dialog)
  await user.tab()
  expect(link).toHaveFocus()

  await user.click(dialog)
  await user.keyboard('{Shift>}{Tab}')
  expect(closeButton).toHaveFocus()
})

describe('WAI-ARIA Roles, States, and Properties', () => {
  test('The element that serves as the dialog container has a role of dialog', () => {
    render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('The dialog container element has aria-modal set to true', () => {
    render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  test('The dialog has either a value for aria-label or aria-labelledby', () => {
    const { rerender } = render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label')

    rerender(
      <Dialog opened close={() => {}}>
        <Body aria-labelledby='dialog-label'>
          <h2 id='dialog-label'>A dialog</h2>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    expect(dialog).toHaveAttribute('aria-labelledby')

    vi.spyOn(console, 'error').mockImplementation(() => {})

    rerender(
      <Dialog opened close={() => {}}>
        <Body>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    expect(console.error).toHaveBeenCalledWith(
      "Couldn't find a value for either aria-label or aria-labelledby. Please, provide one.",
    )
  })
})

describe('WAI-ARIA Keyboard Interaction', () => {
  test('"Tab" moves focus to the next (or first) tabbable element inside the dialog', async () => {
    const user = userEvent.setup()

    render(<ExampleDialog />)

    const openButton = screen.getByRole('button', { name: /open/i })
    await user.click(openButton)

    const link = screen.getByRole('link')
    const closeButton = screen.getByRole('button', { name: /close/i })

    expect(link).toHaveFocus()
    await user.tab()
    expect(closeButton).toHaveFocus()
    await user.tab()
    expect(link).toHaveFocus()
  })

  test('"Shift + Tab" moves focus to the previous (or last) tabbable element inside the dialog', async () => {
    const user = userEvent.setup()

    render(<ExampleDialog />)

    const openButton = screen.getByRole('button', { name: /open/i })
    await user.click(openButton)

    const link = screen.getByRole('link')
    const closeButton = screen.getByRole('button', { name: /close/i })

    expect(link).toHaveFocus()
    await user.keyboard('{Shift>}{Tab}')
    expect(closeButton).toHaveFocus()
    await user.keyboard('{Shift>}{Tab}')
    expect(link).toHaveFocus()
  })

  test('"Escape" Closes the dialog', async () => {
    const user = userEvent.setup()

    render(<ExampleDialog />)

    const openButton = screen.getByRole('button', { name: /open/i })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(openButton)
    const dialog = screen.getByRole('dialog')
    await user.keyboard('{Escape}')
    expect(dialog).not.toBeInTheDocument()
  })
})

describe('WAI-ARIA Notes', () => {
  test('When the dialog opens, focus moves to a specified (or first) focusable element', async () => {
    const { unmount } = render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <a href='https://example.com/'>A link</a>
          <button data-place-focus>Close dialog</button>
        </Body>
      </Dialog>,
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toHaveFocus()

    unmount()

    render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <a href='https://example.com/'>A link</a>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveFocus()
  })

  test('When the dialog closes, focus returns to the element that triggered it or to a specified one', async () => {
    const user = userEvent.setup()

    const { unmount } = render(<ExampleDialog />)

    let openButton: HTMLButtonElement, closeButton: HTMLButtonElement

    openButton = screen.getByRole('button', { name: /open/i })
    expect(openButton).not.toHaveFocus()
    await user.click(openButton)

    closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(openButton).toHaveFocus()

    unmount()

    render(<DialogWithExplicitFinalFocus />)

    const finalFocusTarget = screen.getByRole('button', { name: /next/i })
    expect(finalFocusTarget).not.toHaveFocus()

    openButton = screen.getByRole('button', { name: /open/i })
    await user.click(openButton)

    closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(finalFocusTarget).toHaveFocus()
  })

  test('The dialog, ideally, includes an element with role button that closes it', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>...</Body>
      </Dialog>,
    )

    expect(console.error).toHaveBeenCalledWith(
      "Couldn't find any focusable element. It's strongly recommended that a dialog includes at least a button that closes it.",
    )
  })

  test("It's possible to initially focus a static element with tabindex='-1'", () => {
    render(
      <Dialog opened close={() => {}}>
        <Body aria-label='A dialog'>
          <a href='https://example.com/'>A link</a>
          <p data-place-focus tabIndex={-1}>
            Static element that could receive focus on dialogs with lots of
            content (multiple paragraphs, lists, etc.), as recommended by the
            guide.
          </p>
          <button>Close dialog</button>
        </Body>
      </Dialog>,
    )

    expect(screen.getByText(/static element/i)).toHaveFocus()
  })
})

function ExampleDialog({
  closeOnClickOutside,
}: {
  closeOnClickOutside?: boolean
}) {
  const [opened, setOpened] = useState(false)

  const open = () => setOpened(true)
  const close = () => setOpened(false)

  return (
    <>
      <button onClick={open}>Open dialog</button>

      <Dialog
        opened={opened}
        close={close}
        closeOnClickOutside={closeOnClickOutside}
      >
        <Backdrop data-testid='backdrop'>
          <Body aria-labelledby='dialog-label'>
            <h2 id='dialog-label'>Dialog title</h2>
            <p>...</p>
            <a href='https://example.com/'>A link</a>
            <div>
              <button onClick={close}>Close dialog</button>
            </div>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}

function DialogWithExplicitFinalFocus() {
  const [opened, setOpened] = useState(false)

  const open = () => setOpened(true)
  const close = () => setOpened(false)

  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button onClick={open}>Open dialog</button>
      <button ref={buttonRef}>Next...</button>

      <Dialog opened={opened} close={close} placeFinalFocusAt={buttonRef}>
        <Body aria-label='A dialog'>
          <button onClick={close}>Close dialog</button>
        </Body>
      </Dialog>
    </>
  )
}

function NestedDialogs() {
  const [opened1, setOpened1] = useState(false)
  const [opened2, setOpened2] = useState(false)
  const [opened3, setOpened3] = useState(false)

  const open1 = () => setOpened1(true)
  const open2 = () => setOpened2(true)
  const open3 = () => setOpened3(true)

  const close1 = () => setOpened1(false)
  const close2 = () => setOpened2(false)
  const close3 = () => setOpened3(false)

  return (
    <>
      <button onClick={open1}>Open 1st dialog</button>

      {/* 3rd */}
      <Dialog opened={opened3} close={close3}>
        <Backdrop data-testid='backdrop'>
          <Body aria-labelledby='dialog3-label'>
            <h2 id='dialog3-label'>3rd dialog title</h2>
            <button onClick={close3}>Close 3rd dialog</button>
          </Body>
        </Backdrop>
      </Dialog>

      {/* 1st */}
      <Dialog opened={opened1} close={close1}>
        <Backdrop data-testid='backdrop'>
          <Body aria-labelledby='dialog1-label'>
            <h2 id='dialog1-label'>1st dialog title</h2>
            <button onClick={open2}>Open 2nd dialog</button>
            <button onClick={close1}>Close 1st dialog</button>
          </Body>
        </Backdrop>
      </Dialog>

      {/* 2nd */}
      <Dialog opened={opened2} close={close2}>
        <Backdrop data-testid='backdrop'>
          <Body aria-labelledby='dialog2-label'>
            <h2 id='dialog2-label'>2nd dialog title</h2>
            <button onClick={open3}>Open 3rd dialog</button>
            <button onClick={close2}>Close 2nd dialog</button>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}

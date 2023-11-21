# Dialog

A dialog is a window presented over the primary or another dialog window, usually used to show quick information or prompt the user.

This solution complies with the Dialog (Modal) pattern as described in the ARIA Authoring Practices Guide (APG):

- ARIA attributes and keyboard navigation are implemented.

- Focus doesn't move outside the dialog window without closing it.

- On dialog open/close, focus is placed on the appropriate element automatically. Specific elements may be provided, though.

- Nested dialogs are supported.

It is **important to notice** that accessibility is open-ended in the sense that some attributes and patterns are too specific to automate. Although instructions will be provided for those cases, **nothing replaces testing things in a real-life scenario**, e.g., with a screen reader.

For more information, check the official guide: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/.

## Usage

First, install the package with `npm install --save-exact @wasamistake/dialog`. As there will probably be breaking changes before version 1, `--save-exact` will minimize the incidence of problems related to that.

Once the package has been installed, import `Dialog`, `Backdrop`, and `Body` from `@wasamistake/dialog`.

A minimal implementation will look something like this:

```tsx
import { Dialog, Backdrop, Body } from '@wasamistake/dialog'

function Wrapper() {
  const [opened, setOpened] = useState(false)

  const open = () => setOpened(true)
  const close = () => setOpened(false)

  return (
    <>
      <button onClick={open}>Open dialog</button>

      <Dialog opened={opened} close={close}>
        <Backdrop>
          <Body aria-labelledby='dialog-label'>
            <h2 id='dialog-label'>Dialog title</h2>
            <div>Some content</div>
            <button onClick={close}>Close dialog</button>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}
```

### Usage with SSR frameworks

This is currently a controlled component. It means that you should manage the state of the dialog as well as place the `'use client'` directive (if needed) at the top of the file that does that.

## Notes

- An accessible label should be provided either with `aria-label` or `aria-labelledby`.

- By default, focus will be placed on the first focusable element when the dialog opens and returned to the trigger element when it closes. However, this behavior should be customized to better match the widget's flow.

- - In general, the initial focus should be placed on the element that is likely to be most used, e.g., a close button.

- - When a dialog has a set of elements that trigger diverse operations, it is recommended to initially place focus on the element that holds the least destructive one, say, a cancel button.

- - If the trigger element won't receive focus back on dialog close because it doesn't exist at the time or for whatever other reason, the final focus should be placed on an element that provides logical work flow.

- If the dialog contains lots of content (multiple paragraphs, lists, etc.) or initially focusing an element would cause content to scroll out of view, it is recommended to add `tabindex='-1'` to a static element at the start of the dialog and focus it.

Check out the examples section below and the [official APG guide](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) for more details.

## Props

Besides the props listed below, any native attribute passed into a component will be forwarded to its rendered element.

### `<Dialog>` props

The `<Dialog>` component controls everything but doesn't render any element per se.

| Name                  | Description                                                                                                                                  | Default value |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `children`\*          | Anything React can render.                                                                                                                   | -             |
| `opened`\*            | The initial dialog state. Either opened (true) or closed (false).                                                                            | -             |
| `close`\*             | A function that should trigger the dialog close.                                                                                             | -             |
| `closeOnClickOutside` | Whether the dialog should close whenever there is a click outside of it.                                                                     | `true`        |
| `placeFinalFocusAt`   | A ref object that points to the element that will receive focus on dialog close. Falls back to the last active element if none is specified. | -             |

Props marked with \* are required.

### `<Backdrop>` props

The `<Backdrop>` component is provided for convenience and as a reminder that **there should be one**. Currently, it doesn't accept any props (besides the native attributes of a `div`), and using it or wrapping things inside a `div` has the same effect.

### `<Body>` props

The `<Body>` component renders the dialog per se, that is, a `div` with the appropriate role and attributes. All content and controls should go inside it. Currently, it doesn't accept any props (besides the native attributes of a `div`).

## Styling

Style it any way you want. `className`, `style`, and any other attribute will be forwarded to each component's rendered element.

```tsx
<Dialog>
  <Backdrop
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <Body className='dialog__body'>...</Body>
  </Backdrop>
</Dialog>
```

## Example: Initial focus placement

To explicitly focus an element when the dialog opens, add the `data-place-focus` attribute to the element that should receive it.

```tsx
function Wrapper() {
  const [opened, setOpened] = useState(false)

  const open = () => setOpened(true)
  const close = () => setOpened(false)

  return (
    <>
      <button onClick={open}>Open dialog</button>

      <Dialog opened={opened} close={close}>
        <Backdrop>
          <Body aria-labelledby='dialog-label'>
            <h2 id='dialog-label'>Dialog title</h2>
            <div>Some content</div>
            <div>
              <button onClick={close}>Cancel</button>
              <button data-place-focus>Proceed</button>
            </div>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}
```

## Example: Final focus placement

To explicitly focus an element when the dialog closes, provide a Ref to the element that should receive it.

```tsx
function Wrapper() {
  const [opened, setOpened] = useState(false)

  const open = () => setOpened(true)
  const close = () => setOpened(false)

  const finalFocusTargetRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button onClick={open}>Open dialog</button>
      <button ref={finalFocusTargetRef}>Next</button>

      <Dialog
        opened={opened}
        close={close}
        placeFinalFocusAt={finalFocusTargetRef}
      >
        <Backdrop>
          <Body aria-labelledby='dialog-label'>
            <h2 id='dialog-label'>Dialog title</h2>
            <div>Some content</div>
            <button onClick={close}>Close dialog</button>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}
```

## Example: Nested dialogs

Nested dialogs are handled, but not recommended.

```tsx
function Wrapper() {
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

      {/* 1st */}
      <Dialog opened={opened1} close={close1}>
        <Backdrop>
          <Body aria-labelledby='dialog1-label'>
            <h2 id='dialog1-label'>1st dialog title</h2>
            <div>Some content...</div>
            <div>
              <button onClick={open2}>Open 2nd dialog</button>
              <button onClick={close1}>Close 1st dialog</button>
            </div>
          </Body>
        </Backdrop>
      </Dialog>

      {/* 2nd */}
      <Dialog opened={opened2} close={close2}>
        <Backdrop>
          <Body aria-labelledby='dialog2-label'>
            <h2 id='dialog2-label'>2nd dialog title</h2>
            <div>Some content...</div>
            <div>
              <button onClick={open3}>Open 3rd dialog</button>
              <button onClick={close2}>Close 2nd dialog</button>
            </div>
          </Body>
        </Backdrop>
      </Dialog>

      {/* 3rd */}
      <Dialog opened={opened3} close={close3}>
        <Backdrop>
          <Body aria-labelledby='dialog3-label'>
            <h2 id='dialog3-label'>3rd dialog title</h2>
            <div>Some content...</div>
            <button onClick={close3}>Close 3rd dialog</button>
          </Body>
        </Backdrop>
      </Dialog>
    </>
  )
}
```

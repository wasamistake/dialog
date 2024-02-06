import React, { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog, Backdrop, Body } from '.'
import './index.stories.css'

const meta: Meta<typeof Dialog> = {
  title: 'Dialog',
  component: Dialog,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Initial: Story = {
  render: function ExampleDialog() {
    const [opened, setOpened] = useState(false)

    const open = () => setOpened(true)
    const close = () => setOpened(false)

    return (
      <>
        <button onClick={open}>Open dialog</button>

        <Dialog opened={opened} close={close}>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog-label' className='dialog__body'>
              <h2 id='dialog-label'>Dialog</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button onClick={close}>Got it!</button>
            </Body>
          </Backdrop>
        </Dialog>
      </>
    )
  },
}

export const InitialFocus: Story = {
  name: 'Example: Initial Focus Placement',
  render: function ExampleDialog() {
    const [opened, setOpened] = useState(false)

    const open = () => setOpened(true)
    const close = () => setOpened(false)

    return (
      <>
        <button onClick={open}>Open dialog</button>

        <Dialog opened={opened} close={close}>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog-label' className='dialog__body'>
              <h2 id='dialog-label'>Dialog</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button data-place-focus onClick={close}>
                Got it!
              </button>
            </Body>
          </Backdrop>
        </Dialog>
      </>
    )
  },
}

export const FinalFocus: Story = {
  name: 'Example: Final Focus Placement',
  render: function ExampleDialog() {
    const [opened, setOpened] = useState(false)

    const open = () => setOpened(true)
    const close = () => setOpened(false)

    const buttonRef = useRef<HTMLButtonElement>(null)

    return (
      <>
        <button onClick={open}>Open dialog</button>
        <button ref={buttonRef}>Next...</button>

        <Dialog opened={opened} close={close} placeFinalFocusAt={buttonRef}>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog-label' className='dialog__body'>
              <h2 id='dialog-label'>Dialog</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button onClick={close}>Got it!</button>
            </Body>
          </Backdrop>
        </Dialog>
      </>
    )
  },
}

export const Nesting: Story = {
  name: 'Example: Nesting',
  render: function NestedDialogs() {
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
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog3-label' className='dialog__body'>
              <h2 id='dialog3-label'>Dialog 3</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button data-place-focus onClick={close3}>
                Close 3rd dialog
              </button>
            </Body>
          </Backdrop>
        </Dialog>

        {/* 1st */}
        <Dialog opened={opened1} close={close1}>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog1-label' className='dialog__body'>
              <h2 id='dialog1-label'>Dialog 1</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button data-place-focus onClick={open2}>
                Open 2nd dialog
              </button>
              <button onClick={close1}>Close 1st dialog</button>
            </Body>
          </Backdrop>
        </Dialog>

        {/* 2nd */}
        <Dialog opened={opened2} close={close2}>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog2-label' className='dialog__body'>
              <h2 id='dialog2-label'>Dialog 2</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button data-place-focus onClick={open3}>
                Open 3rd dialog
              </button>
              <button onClick={close2}>Close 2nd dialog</button>
            </Body>
          </Backdrop>
        </Dialog>
      </>
    )
  },
}

export const MountTarget: Story = {
  name: 'Example: Custom Mount Target',
  render: function ExampleDialog() {
    const [opened, setOpened] = useState(false)

    const open = () => setOpened(true)
    const close = () => setOpened(false)

    useEffect(() => {
      if (document.getElementById('mount-target') === null) {
        const mountTarget = document.createElement('div')
        mountTarget.id = 'mount-target'
        document.body.appendChild(mountTarget)
      }
    }, [])

    return (
      <>
        <button onClick={open}>Open dialog</button>

        <Dialog opened={opened} close={close} container='#mount-target'>
          <Backdrop className='dialog__backdrop'>
            <Body aria-labelledby='dialog-label' className='dialog__body'>
              <h2 id='dialog-label'>Dialog</h2>

              <div className='dialog__description'>
                <p>
                  A dialog is a window overlaid on either the primary window or
                  another dialog window.
                </p>
                <a href='https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'>
                  Read more
                </a>
              </div>

              <button onClick={close}>Got it!</button>
            </Body>
          </Backdrop>
        </Dialog>
      </>
    )
  },
}

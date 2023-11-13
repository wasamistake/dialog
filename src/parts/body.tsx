import React, { useContext } from 'react'
import { DialogContext } from '../index.context'

type BodyProps = React.ComponentPropsWithRef<'div'>

export const Body = React.forwardRef<HTMLDivElement, BodyProps>(
  (props, ref) => {
    const { dialogRef } = useContext(DialogContext)

    if (
      props['aria-label'] === undefined &&
      props['aria-labelledby'] === undefined
    ) {
      console.error(
        "Couldn't find a value for either aria-label or aria-labelledby. Please, provide one.",
      )
    }

    return (
      <div
        {...props}
        aria-modal='true'
        ref={node => {
          dialogRef.current = node

          if (ref === null) return
          typeof ref === 'function' ? ref(node) : (ref.current = node)
        }}
        role='dialog'
        tabIndex={-1}
      />
    )
  },
)

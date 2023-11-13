import React from 'react'

type BackdropProps = React.ComponentPropsWithRef<'div'>

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  (props, ref) => {
    return <div {...props} ref={ref} />
  },
)

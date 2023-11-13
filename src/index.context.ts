import React from 'react'
import type { DialogRef } from '.'

type DialogContext = {
  dialogRef: DialogRef
}

export const DialogContext = React.createContext<DialogContext>({
  dialogRef: { current: null },
})

DialogContext.displayName = 'Dialog'

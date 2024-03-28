import React, { useContext } from 'react'
import type { DialogRef } from '.'

type DialogContext = {
  dialogRef: DialogRef
}

export const DialogContext = React.createContext<DialogContext | null>(null)

DialogContext.displayName = 'Dialog'

export function useDialogContext(errorMessage: string) {
  const value = useContext(DialogContext)

  if (value === null) {
    throw Error(errorMessage)
  }

  return value
}

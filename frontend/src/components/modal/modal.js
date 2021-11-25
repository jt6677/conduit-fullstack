/** @jsxImportSource @emotion/react */

import '@reach/dialog/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import * as React from 'react'

import { CircleButton } from '../lib'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn && fn(...args))

const ModalContext = React.createContext()

function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false)

  return <ModalContext.Provider value={[isOpen, setIsOpen]} {...props} />
}

function ModalDismissButton({ children: child }) {
  const [, setIsOpen] = React.useContext(ModalContext)
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  })
}

function ModalOpenButton({ children: child }) {
  const [, setIsOpen] = React.useContext(ModalContext)
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  })
}

function ModalContents({ children, ...props }) {
  const [isOpen, setIsOpen] = React.useContext(ModalContext)

  return (
    <DialogOverlay
      style={{ background: 'hsla(224, 34%, 64%, 0.85)' }}
      isOpen={isOpen}
      onDismiss={() => setIsOpen(false)}>
      <DialogContent
        className=" rounded-xl"
        style={{
          backgroundColor: '#1E293B',
          // top: '70%',
          margin: '22vh  auto',
          maxWidth: '450px',
        }}
        {...props}>
        <div className="flex justify-end ">
          <ModalDismissButton>
            <CircleButton>
              <VisuallyHidden>Close</VisuallyHidden>
              <span aria-hidden>×</span>
            </CircleButton>
          </ModalDismissButton>
        </div>
        <div className="mt-2">{children}</div>
      </DialogContent>
    </DialogOverlay>
  )
}

export { Modal, ModalContents, ModalDismissButton, ModalOpenButton }

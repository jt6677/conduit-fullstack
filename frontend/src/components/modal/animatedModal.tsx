/** @jsxImportSource @emotion/react */

import '@reach/dialog/styles.css'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import VisuallyHidden from '@reach/visually-hidden'
import React, { createContext, useEffect, useRef } from 'react'
import { animated, AnimatedComponent, useTransition } from 'react-spring'

// import { createCtx } from '~/utils/utils'
// import { CircleButton } from '../lib'

const CircleButton = (props: React.PropsWithChildren<any>) => {
  return (
    <button
      className="flex items-center justify-center w-8 h-8 rounded-full bg-coolGray-500 text-coolGray-100 hover:bg-coolGray-400"
      type="button"
      {...props}
    />
  )
}
export function createCtx<ContextType>() {
  const ctx = React.createContext<ContextType | undefined>(undefined)
  function useCtx() {
    const c = React.useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const
}

const callAll =
  (...fns: any[]) =>
  (...args: any[]) =>
    fns.forEach((fn) => fn && fn(...args))
type ModalContextType = [
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
]
const [useModal, CtxProvider] = createCtx<ModalContextType>()
function ModalProvider(props: React.PropsWithChildren<any>): JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false)

  return <CtxProvider value={[isOpen, setIsOpen]} {...props} />
}

function ModalDismissButton({ children: child }: React.PropsWithChildren<any>) {
  const [, setIsOpen] = useModal()
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  })
}
function ModalOpenButton({ children: child }: React.PropsWithChildren<any>) {
  const [, setIsOpen] = useModal()
  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  })
}

function ModalContents({ title, children, ...props }: any) {
  const [isOpen, setIsOpen] = useModal()
  const rootRef = useRef<any>()
  if (!rootRef.current) {
    rootRef.current = document.getElementById('root')
  }

  const WrappedDialogOverlay = animated(DialogOverlay)
  const WrappedDialogContent = animated(DialogContent)
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, xyz: [0, -30, 0], blur: 0 },
    enter: { opacity: 1, xyz: [0, 0, 0], blur: 8 },
    leave: { opacity: 0, xyz: [0, 30, 0], blur: 0 },
    delay: 200,
    // @ts-ignore
    onChange: (blur) => {
      if (isOpen) rootRef.current.style.filter = `blur(${20}px)`
      if (!isOpen) rootRef.current.style.filter = `blur(${0}px)`
    },
  })
  return transitions(
    ({ opacity, xyz }, item) =>
      item && (
        <WrappedDialogOverlay
          className="relative flex items-center justify-center h-screen "
          style={{ opacity }}
          // isOpen={isOpen}
          onDismiss={() => setIsOpen(false)}>
          <WrappedDialogContent
            style={{
              transform: xyz.to((x, y, z) => `translate3d(${x}px, ${y}px, ${z}px)`),
              bottom: '20%',
              background: 'none',
              maxWidth: '30rem',
              position: 'relative',
            }}
            {...props}>
            {/* <div className="flex justify-end ">
              <ModalDismissButton>
                <CircleButton>
                  <VisuallyHidden>Close</VisuallyHidden>
                  <span aria-hidden>×</span>
                </CircleButton>
              </ModalDismissButton>
            </div> */}
            <div className="m-auto">{children}</div>
          </WrappedDialogContent>
        </WrappedDialogOverlay>
      )
  )
}

export { ModalContents, ModalDismissButton, ModalOpenButton, ModalProvider, useModal }

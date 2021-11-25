import { PaperAirplaneIcon, TrashIcon } from '@heroicons/react/solid'
import { Formik } from 'formik'
import React from 'react'
import { RouteProps, useHistory, useParams } from 'react-router-dom'
import * as Yup from 'yup'

import ButtonWithIcon from '~/components/button_with_icon'
import { ConfirmDeleteModal } from '~/components/confirm_delete'
import {
  ModalContents,
  ModalOpenButton,
  ModalProvider,
} from '~/components/modal/animatedModal'
import { useArticles } from '~/context/ArticlesContext'
import { EditorActionType, editorReducer, initalState } from '~/reducers/editor'
import { IArticle } from '~/types'

export default function Editor(_: RouteProps) {
  const [state, dispatch] = React.useReducer(editorReducer, initalState)
  const [article, setArticle] = React.useState<IArticle>()
  const history = useHistory()
  const { slug } = useParams<{ slug: string }>()
  const { fetchArticle, deleteArticle, postArticle, updateArticle } = useArticles()
  const [loading, setLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState<string | null>()
  const [isError, setIsError] = React.useState<string | null>()
  const [redirectOnLogin, setRedirectOnLogin] = React.useState(false)

  React.useEffect(() => {
    let ignore = false

    const getArticle = async () => {
      try {
        const data = await fetchArticle(slug)
        const { title, description, body, tagList } = data
        setArticle(data)
        // console.log('asdasd', title, description, body, tagList)
        if (!ignore) {
          dispatch({
            type: EditorActionType.SET_FORM,
            form: { title, description, body, tag: '' },
          })
          dispatch({ type: EditorActionType.SET_TAGS, tagList })
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (slug) {
      getArticle()
    }
    return () => {
      ignore = true
    }
  }, [slug])

  const handleSubmit = async ({
    title,
    description,
    body,
  }: {
    title: string
    description: string
    body: string
  }) => {
    setIsError(null)
    setLoading(true)
    console.log(title, description, body)
    try {
      let payload
      // if (slug) then update
      if (slug) {
        payload = await updateArticle(slug, { title, description, body })
        history.push(`/article/${payload}`)
      } else {
        payload = await postArticle({ title, description, body })
        history.push(`/article/${payload}`)
      }
    } catch (error) {
      console.log(error)
      // if (error.status === 422) {
      //   dispatch({ type: 'SET_ERRORS', errors: error.data.errors })
      // }
    }
    // try {
    //   const user = await Signin(email, password)
    //   setIsSuccess('Successfully Signed In')
    //   setTimeout(() => {
    //     setRedirectOnLogin(true)
    //     dispatch({ type: AuthActionType.LOAD_USER, user })
    //   }, 700)
    //   // history.push('/')
    // } catch (error) {
    //   const err = error as AxiosError<IError>
    //   if (err.response) {
    //     setIsError(err.response.data.error)
    //     setTimeout(() => {
    //       setIsError(null)
    //     }, 1200)
    //   } else {
    //     console.log(error)
    //   }
    //   setLoading(false)
    // }
  }
  return (
    <div className="max-w-[85rem] h-screen mx-auto px-2 sm:px-4 lg:px-4 py-6 bg-gray-50">
      <h1 className="order-1 pl-6 text-2xl font-extrabold tracking-tight text-gray-900">
        Post Editor
      </h1>
      <div className="pb-20 mt-2 overflow-hidden bg-white rounded-lg ring-1 ring-gray-900 ring-opacity-5">
        <Formik
          enableReinitialize
          initialValues={{
            title: article?.title || '',
            description: article?.description || '',
            body: article?.body || '',
          }}
          validationSchema={Yup.object({
            title: Yup.string().required('Required'),
            description: Yup.string().required('Required'),
            body: Yup.string().required('Required'),
          })}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(false)
            handleSubmit(values)
          }}>
          {(formik) => (
            <form
              className="relative max-w-5xl px-2 py-4 mx-auto space-y-4 sm:px-6 lg:px-8"
              onSubmit={formik.handleSubmit}>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start ">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Title
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="title"
                    type="text"
                    autoFocus
                    {...formik.getFieldProps('title')}
                    className="block w-full max-w-lg border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {formik.touched.title && formik.errors.title ? (
                    <div className="text-sm text-red-400">{formik.errors.title}</div>
                  ) : null}
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Description
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <input
                    id="description"
                    type="text"
                    autoComplete="family-name"
                    {...formik.getFieldProps('description')}
                    className="block w-full max-w-lg border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm"
                  />
                  {formik.touched.description && formik.errors.description ? (
                    <div className="text-sm text-red-400">
                      {formik.errors.description}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                  Post Content
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2">
                  <textarea
                    id="body"
                    rows={10}
                    {...formik.getFieldProps('body')}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formik.touched.body && formik.errors.body ? (
                    <div className="text-sm text-red-400">{formik.errors.body}</div>
                  ) : null}
                </div>
              </div>
              <div className="absolute right-0 flex mx-auto max-w-7xl sm:px-6 lg:px-8">
                {slug && (
                  <ModalProvider>
                    <ModalOpenButton>
                      <ButtonWithIcon buttonName="Delete" dangerButton>
                        <TrashIcon />
                      </ButtonWithIcon>
                    </ModalOpenButton>
                    <ModalContents aria-label="Delete confirmation">
                      <ConfirmDeleteModal handleDelete={() => deleteArticle(slug)} />
                    </ModalContents>
                  </ModalProvider>
                )}
                <div className="ml-8">
                  <ButtonWithIcon
                    buttonName="Publish Article"
                    disabled={
                      !!formik.errors.title ||
                      !!formik.errors.description ||
                      !!formik.errors.body
                    }>
                    <PaperAirplaneIcon />
                  </ButtonWithIcon>
                </div>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  )
}

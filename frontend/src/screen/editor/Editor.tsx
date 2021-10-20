import React from 'react'
import { useHistory, RouteProps, useParams } from 'react-router-dom'
import { editorReducer, initalState } from '../../reducers/editor'
import { getArticle, updateArticle } from '../../api/ArticlesAPI'
import ListErrors from '../../common/ListErrors'
import { EditorActionType } from '../../reducers/editor'
import { useFetch } from '../../context/FetchContext'

export default function Editor(_: RouteProps) {
  const [state, dispatch] = React.useReducer(editorReducer, initalState)
  let history = useHistory()
  let { slug } = useParams<{ slug: string }>()
  const authClient = useFetch()

  React.useEffect(() => {
    let ignore = false

    const fetchArticle = async () => {
      try {
        const payload = await getArticle(slug)
        const { title, description, body, tagList } = payload.data
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
      fetchArticle()
    }
    return () => {
      ignore = true
    }
  }, [slug])

  const handleChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch({
      type: EditorActionType.UPDATE_FORM,
      field: {
        key: event.currentTarget.name,
        value: event.currentTarget.value,
      },
    })
  }

  const handelKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 13) {
      dispatch({
        type: EditorActionType.ADD_TAG,
        tag: event.currentTarget.value,
      })
      dispatch({
        type: EditorActionType.UPDATE_FORM,
        field: { key: 'tag', value: '' },
      })
    }
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      const { title, description, body } = state.form
      const article = { title, description, body }
      // const article = { title, description, body, tagList: state.tagList }
      let payload
      if (slug) {
        payload = await updateArticle({ slug, ...article })
      } else {
        payload = await authClient(`articles`, {
          method: 'POST',
          data: { ...article },
        })
        //@ts-ignore
        history.push(`/article/${payload}`)
      }
    } catch (error) {
      console.log(error)
      // if (error.status === 422) {
      //   dispatch({ type: 'SET_ERRORS', errors: error.data.errors })
      // }
    }
  }
  return (
    <div className="container pl-4 pr-4 mt-6 ml-auto mr-auto">
      <div className="grid grid-cols-4 ">
        <div className="col-span-2 col-start-2 ">
          <ListErrors errors={state.errors} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                name="title"
                className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                type="text"
                placeholder="Article Title"
                value={state.form.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                name="description"
                className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                type="text"
                placeholder="What's this article about?"
                value={state.form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <textarea
                name="body"
                className="block w-full pl-2 mb-2 border border-gray-300 rounded h-44"
                rows={8}
                placeholder="Write your article (in markdown)"
                value={state.form.body}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                name="tag"
                className="block w-full h-12 pl-2 mb-2 border border-gray-300 rounded"
                type="text"
                placeholder="Enter tags"
                value={state.form.tag}
                onChange={handleChange}
                onKeyUp={handelKeyUp}
              />

              <div className="tag-list">
                {state.tagList.map((tag) => {
                  return (
                    <span className="tag-default tag-pill" key={tag}>
                      <i
                        className="ion-close-round"
                        onClick={() =>
                          dispatch({ type: EditorActionType.REMOVE_TAG, tag })
                        }
                      />
                      {tag}
                    </span>
                  )
                })}
              </div>
            </div>

            <button
              className="px-4 py-2 mb-4 text-lg font-medium text-white bg-green-500 rounded ml-80 "
              type="submit"
            >
              Publish Article
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

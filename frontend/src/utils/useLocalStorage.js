import { useState, useEffect } from 'react'

const safelyParseJson = (parseString) => {
  try {
    return JSON.parse(parseString)
  } catch (e) {
    return null
  }
}
/**
 * An utility to quickly create hooks to access both Session Storage and Local Storage
 */
const useLocalStorage = (storageKey, defaultValue) => {
  const storage = window[`localStorage`]
  //   const x = storage.getItem(storageKey)
  //   console.log(JSON.stringify(defaultValue))
  const [value, setValue] = useState(
    safelyParseJson(storage.getItem(storageKey) || JSON.stringify(defaultValue))
    //     safelyParseJson(JSON.stringify(defaultValue))
  )

  useEffect(() => {
    storage.setItem(storageKey, JSON.stringify(value))
  }, [storageKey, value])
  //   console.log('value', value)
  return [value, setValue]
}

export default useLocalStorage

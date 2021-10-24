// interface ImportMetaEnv {
//   VITE_MESSAGE: string
//   REACT_APP_API_URL: string
//   REACT_APP_CSFF_API_URL: string
//   sb: string
// }
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL_CSRF: string
  readonly VITE_API_URL: string
  // readonly sb: string
  // more env variables...
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

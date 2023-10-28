import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery, useSubscription } from '@apollo/client'
import SetBirthyear from './components/SetBirthyear'
import LoginForm from './components/LoginForm'
import { useApolloClient } from '@apollo/client'
import Recommended from './components/Recommended'
import { BOOK_ADDED } from './queries'

const ALL_AUTHORS = gql`
query {
  allAuthors {
    name,
    id,
    born,
    bookCount
  }
}
`
const ALL_BOOKS = gql`
query {
  allBooks {
    author {
      name
      born
    }
    title
    id
    published
    genres
  }
}
`
const App = () => {

  // const localToken = 

  const [localToken, setLocalToken] = useState(localStorage.getItem('book-list-users-token'))

  const [page, setPage] = useState('authors')

  const result = useQuery(ALL_AUTHORS)

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      client.cache.updateQuery({ query: ALL_BOOKS },
        ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(addedBook),
          }
        })
    }
  })

  useEffect(() => {
    result.refetch()
  }, [page])

  const resultBooks = useQuery(ALL_BOOKS)

  useEffect(() => {
    result.refetch()
  }, [page])
  const client = useApolloClient()

  // if (!token) {
  // return (
  // <div>
  // <Notify errorMessage={errorMessage} />
  {/* <h2>Login</h2> */ }
  {/* <LoginForm */ }
  // setToken={setToken}
  // setError={notify}
  // />
  {/* </div> */ }
  // )
  // }

  if (result.loading) {
    return <p>Loading...</p>;
  }

  if (result.error) {
    return <p>Error while fetching authors: {result.error.message}</p>;
  }

  // Ensure that result.data is defined before accessing it
  if (!resultBooks.data) {
    return <p>Data not available</p>;
  }
  if (resultBooks.loading) {
    return <p>Loading...</p>;
  }

  if (resultBooks.error) {
    return <p>Error while fetching books: {resultBooks.error.message}</p>;
  }

  // Ensure that resultBooks.data is defined before accessing it
  if (!resultBooks.data) {
    return <p>Data not available</p>;
  }
  console.log(result.data, resultBooks.data)

  const logout = () => {
    localStorage.clear()
    client.resetStore()
    setLocalToken('')
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {localToken ? <button onClick={() => setPage('add')}>add book</button> : null}
        {localToken ? <button onClick={() => setPage('edit')}>edit author</button> : null}
        {localToken ? <button onClick={() => setPage('recommended')}>recommended</button> : null}
        {!localToken ? <button onClick={() => setPage('login')}>login</button> : null}
        {localToken ? <button onClick={() => logout()}>logout</button> : null}
      </div>

      <Authors authors={result.data.allAuthors} show={page === 'authors'} />

      <Books books={resultBooks.data.allBooks} show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <LoginForm show={page === 'login'} setToken={setLocalToken} setPage={setPage} />

      <Recommended show={page === "recommended"} books={resultBooks.data.allBooks} />

      <SetBirthyear authors={result.data.allAuthors} show={page === 'edit'} />
    </div>
  )
}

export default App

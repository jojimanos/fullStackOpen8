import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery } from '@apollo/client'
import SetBirthyear from './components/SetBirthyear'
import LoginForm from './components/LoginForm'

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
      id
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

  const [token, setToken] = useState(null)
  // ...

  const [page, setPage] = useState('authors')

  const result = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)

  if (!token) {
    return (
      <div>
        {/* <Notify errorMessage={errorMessage} /> */}
        <h2>Login</h2>
        <LoginForm
        setToken={setToken}
        // setError={notify}
        />
      </div>
    )
  }

  if (result.loading) {
    return <p>Loading...</p>;
  }

  if (result.error) {
    return <p>Error while fetching authors: {result.error.message}</p>;
  }

  // Ensure that result.data is defined before accessing it
  // if (!resultBooks.data) {
    // return <p>Data not available</p>;
  // }
  // if (resultBooks.loading) {
    // return <p>Loading...</p>;
  // }
// 
  // if (resultBooks.error) {
    // return <p>Error while fetching books: {resultBooks.error.message}</p>;
  // }
// 
  // Ensure that result.data is defined before accessing it
  //  if (!resultBooks.data) {
    // return <p>Data not available</p>;
  //  }
  // console.log(result.data, resultBooks.data)


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('edit')}>edit author</button>
      </div>

      <Authors authors={result.data.allAuthors} show={page === 'authors'} />

      {/* <Books books={resultBooks.data.allBooks} show={page === 'books'} /> */}

      <NewBook show={page === 'add'} />

      {/* <SetBirthyear authors={result.data.allAuthors} show={page === 'edit'} /> */}
    </div>
  )
}

export default App

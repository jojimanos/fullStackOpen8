import { useEffect, useState } from "react"
import { gql, useApolloClient, useQuery, useSubscription } from "@apollo/client"
import { BOOK_ADDED } from "../queries"

const Books = ({ books, show }) => {

  const ALL_BOOKS_FILTERED = gql`
query allBooks($genres: [String]) {
  allBooks(genres: $genres) {
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

  const client = useApolloClient()

  const [genreFilter, setGenreFilter] = useState(null)

  const booksList = useQuery(ALL_BOOKS_FILTERED, {
    variables: { genres: genreFilter }
  })

  const { refetch } = useQuery(ALL_BOOKS_FILTERED, { variables: { genres: genreFilter } })

  useEffect(() => {
    refetch({ genres: genreFilter })
  }, [show])

  //useSubscription(BOOK_ADDED, {
  //  onData: ({ data }) => {
  //    const addedBook = data.data.bookAdded
  //    // notify(`${addedBook.name} added`)
  //    client.cache.updateQuery({ query: ALL_BOOKS },
  //      ({ allBooks }) => {
  //        return {
  //          allBooks: allBooks.concat(addedBook),
  //        }
  //      })
  //  }
  //})

  if (booksList.loading)
    return <div>Loading...</div>

  if (booksList.error)
    return <div>Error...</div>

  if (booksList.data === undefined)
    return <div>No data</div>

  const booksFiltered = booksList.data.allBooks

  console.log(booksList.data, genreFilter)

  if (!show) {
    return null
  }

  const genresKeyValues = books.map(b => b.genres)
  const genresKeyValuesMerged = [].concat(...genresKeyValues)
  const genres = [...new Set(genresKeyValuesMerged)]

  return (
    <div>
      <h2>books</h2>

      {genreFilter !== null ? <h4>genre: {genreFilter}</h4> : null}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {genreFilter !== null ?
            booksFiltered.map((a) => (
              <tr key={a.title} hidden={a.genres.includes(genreFilter) ? false : true}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )) :
            booksFiltered.map((a) => (
              <tr key={a.title} hidden={false}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <div>
        {genres.map((g, i) => {
          return <button
            onClick={() => { setGenreFilter(g) }}
            key={i} id={i}>{g}</button>
        })}
        <button onClick={() => setGenreFilter(null)}>remove filter</button>
      </div>

    </div>
  )
}

export default Books

import { useEffect, useState } from "react"
import { gql, useQuery } from "@apollo/client"

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

  const [genreFilter, setGenreFilter] = useState(null)

  const booksList = useQuery(ALL_BOOKS_FILTERED, {
    variables: {genres: genreFilter}
  })

  const {refetch} = useQuery(ALL_BOOKS_FILTERED, {variables: {genres: genreFilter}})

  useEffect(() => {
    refetch({genres: genreFilter})
  }, [show])

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

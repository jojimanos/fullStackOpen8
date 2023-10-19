import { useState } from "react"

const Books = ({ books, show }) => {

  const [genreFilter, setGenreFilter] = useState('')

  if (!show) {
    return null
  }

  const genresKeyValues = books.map(b => b.genres)
  const genresKeyValuesMerged = [].concat(...genresKeyValues)
  const genres = [...new Set(genresKeyValuesMerged)]

  return (
    <div>
      <h2>books</h2>

      {genreFilter !== "" ? <h4>genre: {genreFilter}</h4> : null}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {genreFilter !== "" ?
            books.map((a) => (
              <tr key={a.title} hidden={a.genres.includes(genreFilter) ? false : true}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )) :
            books.map((a) => (
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
        <button onClick={() => setGenreFilter('')}>remove filter</button>
      </div>

    </div>
  )
}

export default Books

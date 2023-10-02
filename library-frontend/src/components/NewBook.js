import { gql, useMutation } from '@apollo/client'
import { useState } from 'react'

const NEW_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) {
      title
      author
      genres
      id
    }
  }
`;

const ALL_BOOKS = gql`
query {
  allBooks {
    author,
    title,
    id,
    published,
    genres
  }
}
`

const NewBook = (props) => {
  
  // if (!props.show) {
    // return null
  // }
  
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [update] = useMutation(NEW_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }]
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    const publishedInt = parseInt(published, 10)

    await update({ variables: { title: title, author: author, published: publishedInt, genres: genres } })

    props.books = [...props.books, { title: title, author: author, published: publishedInt, genres: genres }]

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')

  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
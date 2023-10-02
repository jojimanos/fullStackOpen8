import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'

const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      id 
      born
    }
  }
`;

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
const SetBirthyear = (props) => {

  // if (!props.show) {
  // return null
  // }

  const [author, setAuthor] = useState('')
  const [birthyear, setBirthyear] = useState(0)

  const [update] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    const birthyearInt = parseInt(birthyear, 10)

    await update({ variables: { name: author, setBornTo: birthyearInt } })

    setAuthor('')
    setBirthyear(0)

  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          birthyear
          <input
            type="number"
            value={birthyear}
            onChange={({ target }) => setBirthyear(target.value)}
          />
        </div>
        <button type="submit">set birthyear</button>
      </form>
    </div>
  )
}

export default SetBirthyear
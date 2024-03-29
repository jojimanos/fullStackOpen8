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
`

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
    console.log(birthyearInt)

    await update({ variables: { name: author, setBornTo: birthyearInt } })

    setAuthor('')
    setBirthyear(0)

  }

  return (
    <div>
      <h4>edit author</h4>
      <form onSubmit={submit}>
        <select value={author} onChange={e => setAuthor(e.target.value)}>
          {props.authors.map((a, i) => { return <option key={i} value={a.name}>{a.name}</option> })}
        </select>
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
import { useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'

const LoginForm = ({ setError, setToken, show, setPage}) => {


    const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    } 
    `

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            // setError(error.graphQLErrors[0].message)
            console.log(`Login error ${error.message}`)
        }
    })


    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('book-list-users-token', token)
        }
    }, [result.data])

    const submit = async (event) => {
        event.preventDefault()

        login({ variables: { username, password } })
        setPage('authors')
        setUsername('')
        setPassword('')
    }

  if (!show) {
    return null
  }

    return (
        <div>
            <form onSubmit={submit}>
                <div>
                    username <input
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    password <input
                        type='password'
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>login</button>
            </form>
        </div>
    )
}

export default LoginForm
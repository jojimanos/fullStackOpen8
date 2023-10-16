import { useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'

const LoginForm = ({ setError, setToken }) => {

    const LOGIN = gql`
    mutation login($username: String!) {
        login(username: $username) {
            value
        }
    } 
    `

    const [username, setUsername] = useState('')
    // const [password, setPassword] = useState('')


    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
        }
    })


    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('phonenumbers-user-token', token)
        }
    }, [result.data])

    const submit = async (event) => {
        event.preventDefault()

        login({ variables: { username } })
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
                        // value={password}
                        // onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type='submit'>login</button>
            </form>
        </div>
    )
}

export default LoginForm
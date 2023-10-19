import { gql, useQuery } from "@apollo/client"

const Recommended = ({ books, show }) => {

    const USER = gql`
   query {
        me {
            username
            favouriteGenre
        }
   } 
   `

   const user = useQuery(USER) 
   console.log(user)

    if (!show)
        return null

    const filteredBooks = books.filter(b => b.genres.includes(user.data.me.favouriteGenre))
    console.log("Recommended", filteredBooks, user.data.me.favouriteGenre)

    return (
        <div>
            <h2>Recommended Books</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {filteredBooks.map((a) => (
                        <tr key={a.title} hidden={false}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Recommended
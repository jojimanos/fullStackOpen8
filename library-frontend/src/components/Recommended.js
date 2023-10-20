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
    const {data: userData} = useQuery(USER)
    const favouriteGenre = userData?.me?.favouriteGenre
    const {data: filteredBookData} = useQuery(ALL_BOOKS_FILTERED, {
     skip: !favouriteGenre,   variables: {genres: favouriteGenre}
    })
    if (!userData)
    return 

    // const filteredBooks = books.filter(b => b.genres.includes(userData.me.favouriteGenre))
    // console.log("Recommended", filteredBooks, userData.me.favouriteGenre)
    console.log("Recommended", filteredBookData)

    if (!show)
        return null
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
                    {filteredBookData.allBooks.map((a) => (
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
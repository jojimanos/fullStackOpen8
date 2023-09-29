import { gql, useQuery } from "@apollo/client"

// const ALL_BOOKS = gql`
// query {
  // allBooks {
    // author,
    // title,
    // id,
    // published
  // }
// }
// `

const Books = ({books}) => {

  // const result = useQuery(ALL_BOOKS)

  // if (result.loading) {
    // return <p>Loading...</p>;
  // }
// 
  // if (result.error) {
    // return <p>Error: {result.error.message}</p>;
  // }

  // Ensure that result.data is defined before accessing it
  // if (!result.data) {
    // return <p>Data not available</p>;
  // }
// 
  // console.log(result)
// 
  // const books = result.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books

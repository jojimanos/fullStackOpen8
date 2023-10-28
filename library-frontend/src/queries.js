import { gql } from "@apollo/client"

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
    id
    title
    author
    published
    genres
}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
        title
        author {
            name
        }
    }
  }
`
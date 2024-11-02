// Enum to manage unique query keys for react-query, organizing keys by function for maintainability and clarity
export enum QUERY_KEYS {
  // **AUTH KEYS**: Keys related to authentication and account management
  CREATE_USER_ACCOUNT = "createUserAccount", // For creating a new user account

  // **USER KEYS**: Keys related to retrieving user data
  GET_CURRENT_USER = "getCurrentUser", // For fetching currently authenticated user data
  GET_USERS = "getUsers", // For fetching all users (used in admin/user management contexts)
  GET_USER_BY_ID = "getUserById", // For retrieving data of a specific user by ID

  // **POST KEYS**: Keys for operations related to post management
  GET_POSTS = "getPosts", // For fetching a list of posts
  GET_INFINITE_POSTS = "getInfinitePosts", // For infinite scroll or pagination on posts
  GET_RECENT_POSTS = "getRecentPosts", // For fetching the most recent posts
  GET_POST_BY_ID = "getPostById", // For fetching a single post by ID
  GET_USER_POSTS = "getUserPosts", // For retrieving posts created by a specific user
  GET_FILE_PREVIEW = "getFilePreview", // For getting a preview URL for an attached file

  // **SEARCH KEYS**: Keys for search operations
  SEARCH_POSTS = "getSearchPosts", // For searching posts based on user-provided criteria
}

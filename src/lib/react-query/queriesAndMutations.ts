import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPost,
  createUserAccount,
  deletePost,
  deleteSavedPost,
  getCurrentUser,
  getInfinitePosts,
  getPostById,
  getRecentPosts,
  getUserById,
  getUserPosts,
  getUsers,
  likePost,
  savePost,
  searchPosts,
  signInAccount,
  signOutAccount,
  updatePost,
  updateUser,
} from "../appwrite/api";
import { QUERY_KEYS } from "./queryKeys";

// Function to handle user account creation by calling the `createUserAccount` API with user data
const createUserAccountMutationFn = (user: INewUser) => createUserAccount(user); // Initiates the process of creating a new user account

// Custom hook `useCreateUserAccount` to manage the user account creation process
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: createUserAccountMutationFn, // Specifies the mutation function to use for account creation
  });
};

// Function to handle user sign-in by calling the `signInAccount` API with email and password
const signInAccountMutationFn = (user: { email: string; password: string }) =>
  signInAccount(user); // Sends user credentials for authentication

// Custom hook `useSignInAccount` to manage user sign-in
export const useSignInAccount = () => {
  return useMutation({
    mutationFn: signInAccountMutationFn, // Mutation function to execute sign-in process
  });
};

// Function to handle the account sign-out by calling the `signOutAccount` API
const signOutAccountMutationFn = () => signOutAccount(); // Initiates user sign-out process

// Custom hook `useSignOutAccount` to manage user sign-out
export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccountMutationFn, // Mutation function to execute sign-out
  });
};

// Function to create a new post by calling the `createPost` API with the post data
const createAccountMutationFn = (post: INewPost) => createPost(post); // Executes the post creation with provided data

// Custom hook `useCreatePost` manages the creation of a new post and refreshes recent posts cache on success
export const useCreatePost = () => {
  const queryClient = useQueryClient(); // Access the query client to manage and interact with cached queries

  return useMutation({
    mutationFn: createAccountMutationFn, // Mutation function to execute post creation
    onSuccess: () => {
      // On successful post creation, invalidate recent posts cache to display the new post
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // Key to refresh recent posts data in the cache
      });
    },
  });
};

// Function to fetch the recent posts by calling the `getRecentPosts` API
const getRecentPostsFn = () => getRecentPosts(); // Retrieves the latest posts from the server

// Custom hook `useGetRecentPosts` manages fetching and caching of recent posts
export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // Unique cache key to identify and manage recent posts data
    queryFn: getRecentPostsFn, // Function to fetch recent posts data
  });
};

// Function to like a post by calling the `likePost` API with the post ID and current likes array
const getLikePostFn = ({
  postId,
  likesArray,
}: {
  postId: string;
  likesArray: string[];
}) => likePost(postId, likesArray); // Calls the likePost function with provided postId and likesArray

// Custom hook `useLikePost` manages the process of liking a post and refreshing related data in the cache
export const useLikePost = () => {
  const queryClient = useQueryClient(); // Access the query client for cache control

  return useMutation({
    mutationFn: getLikePostFn, // Function to execute when liking a post
    onSuccess: (data) => {
      // On successful mutation, invalidate relevant cached queries to ensure updated data is fetched
      [
        [QUERY_KEYS.GET_POST_BY_ID, data?.$id], // Refresh the specific post to update its like status
        [QUERY_KEYS.GET_RECENT_POSTS], // Refresh recent posts to reflect updated like counts
        [QUERY_KEYS.GET_POSTS], // Refresh general posts list for consistency
        [QUERY_KEYS.GET_CURRENT_USER], // Refresh current user data to reflect any user-related updates
      ].forEach(
        (queryKey) => queryClient.invalidateQueries({ queryKey }) // Invalidate each query key to fetch updated data
      );
    },
  });
};

// Function to save a post by calling the `savePost` API with the post ID and user ID
const getSavePostFn = ({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) => savePost(postId, userId); // Executes the save action for the post with provided IDs

// Custom hook `useSavePost` manages the post-saving action and refreshes related cache data on success
export const useSavePost = () => {
  const queryClient = useQueryClient(); // Access the query client for cache management

  return useMutation({
    mutationFn: getSavePostFn, // Function to execute when saving a post
    onSuccess: () => {
      // On successful mutation, invalidate cached queries to ensure refreshed data
      [
        [QUERY_KEYS.GET_RECENT_POSTS], // Refresh recent posts to reflect the saved status
        [QUERY_KEYS.GET_POSTS], // Refresh general posts list for consistency
        [QUERY_KEYS.GET_CURRENT_USER], // Refresh current user data to reflect updated saved posts
      ].forEach(
        (queryKey) => queryClient.invalidateQueries({ queryKey }) // Invalidate each query key to fetch updated data
      );
    },
  });
};

// Function to delete a saved post by calling the `deleteSavedPost` API with the saved record ID
const getDeleteSavedPostFn = (savedRecordId: string) =>
  deleteSavedPost(savedRecordId); // Executes the delete action for the specified saved record

// Custom hook `useDeleteSavedPost` manages the deletion of saved posts and refreshes related data in the cache
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient(); // Access the query client to manage cache

  return useMutation({
    mutationFn: getDeleteSavedPostFn, // Function to execute when deleting a saved post
    onSuccess: () => {
      // Invalidate relevant cached queries to ensure the UI reflects updated data after deletion
      [
        [QUERY_KEYS.GET_RECENT_POSTS], // Refresh recent posts to remove the deleted saved post
        [QUERY_KEYS.GET_POSTS], // Refresh general posts list for consistency
        [QUERY_KEYS.GET_CURRENT_USER], // Refresh current user data to update their saved posts list
      ].forEach(
        (queryKey) => queryClient.invalidateQueries({ queryKey }) // Invalidate each query key to fetch fresh data
      );
    },
  });
};

// Function to fetch the current user by calling the `getCurrentUser` API
const getCurrentUserFn = () => getCurrentUser(); // Retrieves current user data from the server

// Custom hook `useGetCurrentUser` manages the retrieval of the current user's data with caching
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER], // Unique cache key for the current user's data
    queryFn: getCurrentUserFn, // Function to fetch current user data
  });
};

// Function to fetch a post by its ID using React Query
export const useGetPostById = (postId: string) => {
  return useQuery({
    // Unique query key array to cache and identify the query in React Query's cache
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],

    // Function API that retrieves the post by ID from the database
    queryFn: () => getPostById(postId),

    // Enables the query only if a valid postId is provided, preventing unnecessary calls
    enabled: Boolean(postId),
  });
};

// Function to handle updating a post and invalidating relevant cache
export const useUpdatePost = () => {
  const queryClient = useQueryClient(); // Access the query client for cache management

  return useMutation({
    // Function to perform the post update
    mutationFn: (post: IUpdatePost) => updatePost(post),

    // Callback to execute on successful mutation
    onSuccess: (data) => {
      // Invalidate the cache for the updated post, triggering a fresh fetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id], // Ensures cache is invalidated only for the specific post
      });
    },
  });
};

// Function to handle deletion of a post and invalidate relevant cache
export const useDeletePost = () => {
  const queryClient = useQueryClient(); // Access the query client for cache management

  return useMutation({
    // Function to perform the deletion, accepting an object with postId and imageId
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),

    // Callback to execute on successful deletion
    onSuccess: () => {
      // Invalidate the cache for recent posts, prompting a refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS], // Target only the recent posts query
      });
    },
  });
};

export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: getInfinitePosts,
    //@ts-ignore
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.documents.length === 0) return null;

      const lastId = lastPage.documents[lastPage?.documents.length - 1].$id;

      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: Boolean(searchTerm),
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: Boolean(userId),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

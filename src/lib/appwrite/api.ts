import { ID, ImageGravity, Query } from "appwrite";

import { INewPost, INewUser, ISaveUserToDB, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { generateRandomString, processTags, sanitizeUsername } from "../utils";

// Function to create a new user account
export async function createUserAccount(user: INewUser) {
  // Generate a unique user ID by sanitizing the username and appending a random string
  const userId = `${sanitizeUsername(user.username)}_${generateRandomString()}`;

  try {
    // Create a new account with the generated user ID, email, password, and name
    const newAccount = await account.create(
      userId,
      user.email,
      user.password,
      user.name
    );
    if (!newAccount) throw new Error("Account creation failed");

    // Generate an avatar URL from the user's name
    const avatarUrlAsURL = new URL(avatars.getInitials(newAccount.name));

    // Save the new user details to the database
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrlAsURL,
    });

    return newUser;
  } catch (error) {
    console.error("An error occurred while creating the user account:", error);
    return null;
  }
}

// Function to save a user to the database
export async function saveUserToDB(user: ISaveUserToDB) {
  try {
    // Create a new user document in the database
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId, // ID of the database to use
      appwriteConfig.userCollectionId, // ID of the user collection in the database
      ID.unique(), // Generate a unique ID for the new document
      user // Pass the user data to be saved
    );

    // Return the newly created user document
    return newUser;
  } catch (error) {
    // Log any errors that occur during the document creation process
    console.error(
      "An error occurred while saving the user to the database:",
      error
    );
    throw new Error("Failed to save user to the database");
  }
}

// Function to sign in a user account using email and password
export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Create a new session for the user using email and password
    const session = await account.createEmailPasswordSession(
      user.email, // User's email address
      user.password // User's password
    );

    // Return the session object if sign-in is successful
    return session;
  } catch (error) {
    // Log any errors that occur during the sign-in process
    console.error("An error occurred during sign-in:", error);
    // Return null or rethrow the error depending on your error handling strategy
    return null;
  }
}

// Function to get the current user's account details
export async function getAccount() {
  try {
    // Fetch the current account details from the server
    const currentAccount = await account.get();

    // Return the current account details if successful
    return currentAccount;
  } catch (error) {
    // Log and throw a descriptive error if fetching fails
    console.error("Failed to fetch account details:", error);
    throw new Error("Failed to fetch account details");
  }
}

// Function to get the current user details from the database
export async function getCurrentUser() {
  try {
    // Fetch the current account details
    const currentAccount = await getAccount();

    // If no current account is found, throw an error
    if (!currentAccount) throw new Error("No current account found");

    // Query the database for the user document that matches the current account ID
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId, // ID of the database
      appwriteConfig.userCollectionId, // ID of the user collection
      [Query.equal("accountId", currentAccount.$id)] // Query to match the account ID
    );

    // If no user document is found, throw an error
    if (!currentUser || currentUser.total === 0)
      throw new Error("No user document found");

    // Return the first document in the list of user documents
    return currentUser.documents[0];
  } catch (error) {
    // Log any errors that occur during the process
    console.error(
      "An error occurred while fetching the current user details:",
      error
    );
    // Return null if an error occurs
    return null;
  }
}

// Function to sign out the current user
export async function signOutAccount() {
  try {
    // Delete the current session to sign out the user
    const session = await account.deleteSession("current");

    // Return the session object if sign-out is successful
    return session;
  } catch (error) {
    // Log any errors that occur during the sign-out process
    console.error("An error occurred during sign-out:", error);
    throw new Error("Failed to sign out");
  }
}

// Function to create a new post
export async function createPost(post: INewPost) {
  try {
    // Upload the file associated with the post
    const uploadedFile = await uploadFile(post.file[0]);

    // Throw an error if file upload fails
    if (!uploadedFile) throw new Error("File upload failed");

    // Get the file preview URL
    const fileUrl = getFilePreview(uploadedFile.$id);

    // If file preview fails, delete the uploaded file and throw an error
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Failed to get file preview");
    }

    // Process tags, removing spaces and splitting by comma
    const tags = processTags(post.tags);

    // Create a new document in the post collection of the database
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.postCollectionId, // Post collection ID
      ID.unique(), // Generate a unique ID for the new document
      {
        creator: post.userId, // ID of the post creator
        caption: post.caption, // Caption for the post
        imageUrl: fileUrl, // URL of the uploaded image
        imageId: uploadedFile.$id, // ID of the uploaded image
        location: post.location, // Location associated with the post
        tags: tags, // Tags associated with the post
      }
    );

    // If creating the new post fails, delete the uploaded file and throw an error
    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Failed to create new post");
    }

    // Return the newly created post
    return newPost;
  } catch (error) {
    // Log any errors that occur during the post creation process
    console.error("An error occurred while creating the post:", error);
    throw new Error("Post creation failed");
  }
}

// Function to upload a file to the specified storage bucket
export async function uploadFile(file: File) {
  try {
    // Upload the file to the specified storage bucket
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId, // ID of the storage bucket
      ID.unique(), // Generate a unique ID for the file
      file // The file to be uploaded
    );

    // Return the uploaded file object if successful
    return uploadedFile;
  } catch (error) {
    // Log any errors that occur during the file upload process
    console.error("An error occurred while uploading the file:", error);
    throw new Error("File upload failed");
  }
}

// Function to get a preview URL for a specific file
export function getFilePreview(fileId: string): string | null {
  try {
    // Get the file preview URL with specified dimensions and gravity
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId, // ID of the storage bucket
      fileId, // ID of the file to preview
      2000, // Width of the preview
      2000, // Height of the preview
      ImageGravity.Top, // Gravity of the image preview (Top alignment)
      100 // Quality of the preview image
    );

    // Return the file preview URL if successful
    return fileUrl;
  } catch (error) {
    // Log any errors that occur during the process
    console.error("An error occurred while getting the file preview:", error);
    return null; // Return null if an error occurs
  }
}

// Function to delete a file by its ID
export async function deleteFile(fileId: string) {
  try {
    // Attempt to delete the file from the specified storage bucket
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    // Return a status object indicating success
    return { status: "ok" };
  } catch (error) {
    // Log any errors that occur during the file deletion process
    console.error("An error occurred while deleting the file:", error);
    throw new Error("File deletion failed");
  }
}

// Function to fetch the most recent posts from the database
export async function getRecentPosts() {
  try {
    // Query the database to list documents from the posts collection
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId, // ID of the database
      appwriteConfig.postCollectionId, // ID of the collection containing posts
      [
        Query.orderDesc("$createdAt"), // Order posts by creation date in descending order
        Query.limit(20), // Limit the results to the 20 most recent posts
      ]
    );

    // If no posts are found, throw an error
    if (!posts.documents.length) throw new Error("No posts found");

    // Return the list of posts if the query is successful
    return posts;
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error("An error occurred while fetching the recent posts:", error);
    throw new Error("Failed to fetch recent posts");
  }
}

// Function to update the likes on a post
export async function likePost(postId: string, likesArray: string[]) {
  try {
    // Update the document in the posts collection with the new likes array
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId, // ID of the database
      appwriteConfig.postCollectionId, // ID of the post collection
      postId, // ID of the post to update
      { likes: likesArray } // Updated likes array
    );

    // If the update fails, throw an error
    if (!updatedPost) throw new Error("Failed to update likes");

    // Return the updated post document if the update is successful
    return updatedPost;
  } catch (error) {
    // Log any errors that occur during the update process
    console.error("An error occurred while updating likes:", error);
    throw new Error("Failed to update likes");
  }
}

// Function to save a post by a specific user
export async function savePost(postId: string, userId: string) {
  try {
    // Create a new document in the saves collection
    const savedPost = await databases.createDocument(
      appwriteConfig.databaseId, // ID of the database
      appwriteConfig.savesCollectionId, // ID of the saves collection
      ID.unique(), // Generate a unique ID for the new document
      {
        user: userId, // ID of the user saving the post
        post: postId, // ID of the post being saved
      }
    );

    // If the creation fails, throw an error
    if (!savedPost) throw new Error("Failed to save the post");

    // Return the newly created document if the creation is successful
    return savedPost;
  } catch (error) {
    // Log any errors that occur during the process
    console.error("An error occurred while saving the post:", error);
    throw new Error("Failed to save the post");
  }
}

// Function to delete a saved post record
export async function deleteSavedPost(savedRecordId: string) {
  try {
    // Attempt to delete the document from the saves collection
    const deletionStatus = await databases.deleteDocument(
      appwriteConfig.databaseId, // ID of the database
      appwriteConfig.savesCollectionId, // ID of the saves collection
      savedRecordId // ID of the saved post record to delete
    );

    // If the deletion fails, throw an error
    if (!deletionStatus) throw new Error("Failed to delete saved post");

    // Return a status object indicating success
    return { status: "ok" };
  } catch (error) {
    // Log any errors that occur during the deletion process
    console.error("An error occurred while deleting the saved post:", error);
    throw new Error("Failed to delete saved post");
  }
}

// Function to retrieve a post by its ID from the database
export async function getPostById(postId: string) {
  try {
    // Fetch the post document from the database using its ID
    const post = await databases.getDocument(
      appwriteConfig.databaseId, // Database ID for Appwrite
      appwriteConfig.postCollectionId, // Collection ID for posts
      postId // The unique ID of the post to retrieve
    );

    // If the post does not exist, throw an error to handle this case
    if (!post) throw new Error("Post not found");

    return post; // Return the fetched post document if retrieval is successful
  } catch (error) {
    // Log the error for debugging purposes
    console.error("An error occurred while fetching the post:", error);

    // Throw a new error to notify the calling function of the failure
    throw new Error("Failed to fetch post");
  }
}

// Function to update a post with new data, including optional file upload
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0; // Check if there's a file to update

  try {
    // Initialize the image data with existing values (defaults if no new file is uploaded)
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    // Proceed to upload a new file if it exists
    if (hasFileToUpdate) {
      // Upload the new file to Appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("File upload failed");

      // Generate a preview URL for the uploaded file
      const fileUrlString = getFilePreview(uploadedFile.$id);
      if (!fileUrlString) {
        // Clean up the uploaded file if URL generation fails
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to generate file URL");
      }

      // Convert the file URL string to a URL object and update image data
      const fileUrl = new URL(fileUrlString);
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Process the post tags by trimming spaces and splitting by comma
    const tags = processTags(post.tags);

    // Update the document in the database with new or existing data
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl, // New or existing image URL
        imageId: image.imageId, // New or existing image ID
        location: post.location, // Post location information
        tags: tags, // Processed tags
      }
    );

    // If updating the post fails, clean up any newly uploaded file and throw an error
    if (!updatedPost) {
      if (hasFileToUpdate) await deleteFile(image.imageId);
      throw new Error("Failed to update post");
    }

    return updatedPost; // Return the successfully updated post data
  } catch (error) {
    console.error("An error occurred while updating the post:", error); // Log any error for debugging
    throw new Error("Post update failed"); // Notify that the post update process failed
  }
}

// Function to delete a post and its associated image
export async function deletePost(postId?: string, imageId?: string) {
  // Ensure both postId and imageId are provided; log warning if not and exit early
  if (!postId || !imageId) {
    console.warn("Missing postId or imageId. Deletion aborted.");
    return {
      status: "Error",
      message: "postId and imageId are required for deletion.",
    };
  }

  try {
    // Attempt to delete the post document from the database
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId, // Database ID where the post resides
      appwriteConfig.postCollectionId, // Collection ID for posts
      postId // Unique ID of the post to delete
    );

    // Throw error if document deletion fails
    if (!statusCode) {
      throw new Error(`Failed to delete post document with postId: ${postId}`);
    }

    // Attempt to delete the associated image file using the image ID
    await deleteFile(imageId);

    // Return success status if both deletions are successful
    return {
      status: "Ok",
      message: "Post and associated image deleted successfully.",
    };
  } catch (error) {
    // Log specific error details to help with debugging
    console.error(
      `An error occurred during deletion of postId: ${postId}, imageId: ${imageId}`,
      error
    );

    // Return a structured error object for more informative error handling by the caller
    return {
      status: "Error",
      message:
        error instanceof Error ? error.message : "Unknown deletion error",
    };
  }
}

// Function to fetch posts with support for infinite scrolling
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  // Initialize the query array with common query parameters
  // - `orderDesc("$updatedAt")`: orders posts by the `updatedAt` timestamp in descending order
  // - `limit(9)`: limits the number of posts per request to 9
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(12)];

  // If `pageParam` is provided, add a cursor query to load the next set of posts
  // - `cursorAfter(pageParam)`: continues pagination from the last seen post based on `pageParam`
  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    // Send a request to the database to retrieve posts based on the specified queries
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId, // Database ID
      appwriteConfig.postCollectionId, // Collection ID for posts
      queries // Query parameters for pagination and sorting
    );

    // Check if the `posts` response is valid; if not, throw a specific error
    if (!posts) {
      throw new Error("No posts found. The response is empty.");
    }

    // Return the list of posts if successful
    return posts;
  } catch (error: any) {
    // Handle known error types
    if (error instanceof TypeError) {
      console.error("Network error: Unable to reach the database service.");
    } else if (error.message === "No posts found. The response is empty.") {
      console.error("Data error: No posts were returned from the database.");
    } else {
      // Log any unexpected errors with a default message
      console.error(
        "An unexpected error occurred while fetching posts:",
        error.message || error
      );
    }

    // Optional: Return a default response or rethrow the error to handle it upstream
    throw error; // or return []; if you want to return an empty array instead of throwing the error
  }
}

// function to performs a search query on posts using a search term
export async function searchPosts(searchTerm: string) {
  try {
    // Initiate a search request to the database using the search term
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId, // The database ID where posts are stored
      appwriteConfig.postCollectionId, // The specific collection ID for posts
      [Query.search("caption", searchTerm)] // Queries posts that contain the search term in their "caption" field
    );

    // Check if posts were returned, if not throw a custom error
    if (!posts || posts.documents.length === 0) {
      throw new Error(`No posts found matching the term: "${searchTerm}"`);
    }

    // Successfully returns the posts if they are found
    return posts;
  } catch (error) {
    // Enhanced error handling: logs the error with specific context for easier debugging
    if (error instanceof Error) {
      console.error(
        `Failed to retrieve posts with search term "${searchTerm}":`,
        error.message
      );
    } else {
      console.error("An unknown error occurred while retrieving posts:", error);
    }

    // Optional: rethrow the error for higher-level handling, if needed
    throw new Error(
      `Error in searchPosts function: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// Importing necessary components and hooks for the 'LikedPosts' component
import GridPostList from "@/components/shared/GridPostList"; // Displays a list of posts in a grid layout
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations"; // Custom hook to get current user data
import { PuffLoader } from "react-spinners"; // Loader component for indicating loading state

// Main functional component to display the user's liked posts
const LikedPosts = () => {
  // Destructuring 'currentUser' data from the 'useGetCurrentUser' hook
  const { data: currentUser } = useGetCurrentUser();

  // If 'currentUser' is not yet loaded or is null, display loading indicator
  if (!currentUser)
    return (
      <div className="flex-center w-full h-full"> {/* Centered container */}
        <PuffLoader color="white" /> {/* Loading spinner with white color */}
      </div>
    );

  // Main return statement, rendering either a message or the list of liked posts
  return (
    <>
      {/* Display a message if there are no liked posts */}
      {currentUser.liked.length === 0 && (
        <p className="text-light-4">No liked posts</p>
      )}

      {/* Display the list of liked posts using 'GridPostList' component */}
      <GridPostList
        posts={currentUser.liked} // Pass liked posts to 'GridPostList'
        showStats={false} // Hide post statistics in this view
        showUser={false} // Hide user info for each post in this view
      />
    </>
  );
};

// Export the 'LikedPosts' component as default export
export default LikedPosts;

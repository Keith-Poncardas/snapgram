// Importing necessary components and libraries
import PostCard from "@/components/shared/PostCard"; // Component to display individual posts
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations"; // Custom hook for fetching recent posts
import { Models } from "appwrite"; // Importing Models from Appwrite SDK
import { PuffLoader } from "react-spinners"; // Loader component for displaying loading state

// Functional component for the Home page
const Home = () => {
  // Using the custom hook to fetch recent posts
  // Destructuring the response to get posts data and loading state
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();

  return (
    <div className="flex flex-1"> {/* Main container with flex layout */}
      <div className="home-container"> {/* Wrapper for home content */}
        <div className="home-posts"> {/* Section for displaying posts */}
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2> {/* Title for the posts section */}

          {/* Conditional rendering: show loader if posts are loading and not yet available */}
          {isPostLoading && !posts ? (
            <PuffLoader color="white" /> // Loader component while posts are being fetched
          ) : (
            // Render the list of posts if available
            <ul className="flex flex-col flex-1 gap-9 w-full"> {/* Flex column for posts */}
              {posts?.documents.map((post: Models.Document) => (
                // Map through the posts and render a PostCard for each
                <PostCard post={post} key={post.caption} /> // Unique key is the post caption
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Exporting the Home component for use in other parts of the application
export default Home;

// Importing the PostForm component to handle the post editing form and logic
import PostForm from "@/components/forms/PostForm";

// Importing the custom hook to fetch a specific post by its ID using React Query
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";

// Importing useParams to access URL parameters, such as the post ID
import { useParams } from "react-router-dom";

// Importing the PuffLoader component to display a loading spinner while fetching data
import { PuffLoader } from "react-spinners";

// Functional component for editing a post
const EditPost = () => {
  // Extract the post ID from the URL parameters
  const { id } = useParams();

  // Use the custom hook to fetch post data by ID:
  // - `data` (aliased as `post`) holds the fetched post data.
  // - `isPending` is a boolean indicating whether data is still loading.
  const { data: post, isPending } = useGetPostById(id || '');

  // Render a loading spinner if data is still being fetched
  if (isPending) {
    return (
      <div className="flex-center w-full h-full">
        <PuffLoader color="white" /> {/* Spinner to indicate loading */}
      </div>
    );
  };

  return (
    // Main container with a flex layout for overall structure
    <div className="flex flex-1">
      {/* Wrapper for content with common styling */}
      <div className="common-container">
        {/* Header container with max width and flex layout */}
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          {/* Icon for the edit post section */}
          <img
            src="/assets/icons/add-post.svg"  // Source of the icon image
            alt="add post"                     // Alt text for screen readers
            width={36}                         // Fixed width for consistent sizing
            height={36}                        // Fixed height for consistent sizing
          />
          {/* Header title for the edit post section */}
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
        </div>

        {/* Rendering the PostForm component with action prop set to "Update" */}
        {/* Passes the fetched post data as a prop to pre-fill the form */}
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

// Exporting the EditPost component for use in other parts of the application
export default EditPost;

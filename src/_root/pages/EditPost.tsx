// Importing the PostForm component to handle post creation
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";
import { PuffLoader } from "react-spinners";

// Functional component for editing a post
const EditPost = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || '');

  if (isPending) return <PuffLoader color="white" />;

  return (
    <div className="flex flex-1"> {/* Main container with flex layout */}
      <div className="common-container"> {/* Wrapper for common styling */}
        <div className="max-w-5xl flex-start gap-3 justify-start w-full"> {/* Container for header elements */}
          <img
            src="/assets/icons/add-post.svg" // Icon for adding a post
            alt="add post" // Alt text for accessibility
            width={36} // Fixed width for the icon
            height={36} // Fixed height for the icon
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2> {/* Title for the Editing post section */}
        </div>

        {/* PostForm component to handle the form for editing a post */}
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

// Exporting the CreatePost component for use in other parts of the application
export default EditPost;

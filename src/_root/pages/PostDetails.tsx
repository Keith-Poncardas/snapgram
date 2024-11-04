import { useParams, Link, useNavigate } from "react-router-dom"; // Import hooks for routing and navigation
import { multiFormatDateString } from "@/lib/utils"; // Utility function for formatting date strings
import { useUserContext } from "@/context/AuthContext"; // Import user context for user authentication details
import { useDeletePost, useGetCurrentUser, useGetPostById, useGetUserPosts } from "@/lib/react-query/queriesAndMutations"; // Import custom hooks for querying and mutating post data
import { Button } from "@/components/ui/button"; // Custom Button component
import { PuffLoader } from "react-spinners"; // Loader component for loading states
import PostStats from "@/components/shared/PostStats"; // Component for displaying post statistics
import GridPostList from "@/components/shared/GridPostList"; // Component for displaying a list of related posts
import { Models } from "appwrite";
import { deleteSavedPost } from "@/lib/appwrite/api";
import { ReadMore } from "@/components/shared/Readmore";

const PostDetails = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { id } = useParams(); // Extract post ID from URL parameters
  const { user } = useUserContext(); // Get current user information from context

  // Query to get post details by ID
  const { data: post, isLoading } = useGetPostById(id as string);
  // Query to get other posts by the same user (creator of current post)
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(post?.creator.$id);
  // Mutation to delete a post
  const { mutate: deletePost } = useDeletePost();

  // Fetch the current user data to check saved posts
  const { data: currentUser } = useGetCurrentUser();

  // Filter related posts excluding the current post
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  // Handler to delete the post and navigate back
  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate("/"); // Navigate back after deletion

    const savedRecordId = currentUser?.save.find((record: Models.Document) => record.post?.$id === post?.$id)?.$id;
    if (savedRecordId) deleteSavedPost(savedRecordId);
  };

  // Check if the current user is not the creator of the post
  // This will be used to conditionally render elements based on ownership
  const checkCurrentUser = user.id !== post?.creator?.$id;

  return (
    <div className="post_details-container">
      {/* Back button for desktop view */}
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {/* Display loading spinner or post details */}
      {isLoading || !post ? (
        <PuffLoader color="white" /> // Show loading spinner if data is loading
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="post image"
            className="post_details-img"
          />

          <div className="post_details-info">
            {/* Creator info and post metadata */}
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator.$id}`}
                className="flex items-center gap-3">
                <img
                  src={
                    post?.creator.imageUrl ||
                    "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator profile"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name} {/* Creator's name */}
                  </p>
                  <div className="flex justify-start gap-2 text-light-3">
                    <ul className="flex items-center gap-4 text-light-3 list-none">
                      <li className="flex items-center relative before:absolute before:-left-4 before:text-light-3 before:text-lg after:ml-1">
                        <p className="subtle-semibold lg:small-regular">
                          {multiFormatDateString(post.$createdAt)} {/* Formatted creation date */}
                        </p>
                      </li>
                      <li className="flex items-center relative before:content-['•'] before:absolute before:-left-4 before:text-light-3 before:text-lg before:mr-1">
                        <p className="subtle-semibold lg:small-regular">{post.location}</p> {/* Location of the post */}
                      </li>
                    </ul>
                  </div>
                </div>
              </Link>

              {/* Edit and delete buttons, only visible if current user is the post creator */}
              {!checkCurrentUser && (
                <div className="flex-center gap-4">
                  <Link
                    to={`/update-post/${post?.$id}`}>
                    <img
                      src={"/assets/icons/edit.svg"}
                      alt="edit"
                      width={24}
                      height={24}
                    />
                  </Link>

                  <Button
                    onClick={handleDeletePost}
                    variant="ghost"
                    className={`post_details-delete_btn`}>
                    <img
                      src={"/assets/icons/delete.svg"}
                      alt="delete"
                      width={24}
                      height={24}
                    />
                  </Button>
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border w-full border-dark-4/80" />

            {/* Post caption and tags */}
            <div className="small-medium lg:base-medium">
              <p> {/* Post caption text */}
                <ReadMore
                  text={post.caption}
                  initialVisibleChars={190}
                  seeMoreLabel="more"
                  seeLessLabel="less"
                  textClassName="text-base"
                  toggleClassName="text-blue-500 font-bold cursor-pointer"
                />
              </p>

              {/* Tags List: Display tags associated with the post */}
              <div className="mt-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-light-3 mr-1">
                    #{tag} {/* Each tag as a list item */}
                  </span>
                ))}
              </div>
            </div>

            {/* Post stats (likes, comments, etc.) */}
            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      {/* Section for related posts */}
      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts {/* Header for related posts */}
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <PuffLoader color="white" /> // Loading spinner for related posts
        ) : (
          <GridPostList posts={relatedPosts} showUser={true} showStats={true} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;

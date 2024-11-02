import { useUserContext } from "@/context/AuthContext"; // Import user context for authentication details
import { multiFormatDateString } from "@/lib/utils"; // Utility function for date formatting
import { Models } from "appwrite"; // Types from Appwrite SDK
import { Link } from "react-router-dom"; // Link component for navigation
import PostStats from "./PostStats"; // PostStats component for displaying post interactions
import { ReadMore } from "./Readmore";

// Define the types for the component's props
type PostCardProps = {
  post: Models.Document;
};

// PostCard Component: Displays individual post data
const PostCard = ({ post }: PostCardProps) => {
  // Access user data from the user context
  const { user } = useUserContext();

  // Early return if post or creator data is missing
  if (!post?.creator) return null;

  // Destructure post properties for readability and easy access
  const { creator, $createdAt, location, caption, tags, imageUrl, $id } = post;

  // Determine if the logged-in user is the creator of the post
  const isUserCreator = user.id === creator.$id;

  return (
    <li className="post-card">
      {/* Header Section: Displays user information and an edit button if the user is the post creator */}
      <div className="flex-between">
        <div className="flex items-center gap-3">
          {/* Link to the creator's profile */}
          <Link to={`/profile/${creator.$id}`}>
            <img
              src={creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${creator.name}'s profile image`}
              className="rounded-full w-12 lg:h-12"
            />
          </Link>

          {/* Display creator name and post date/location details */}
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">{creator.name}</p>
            <div className="flex justify-start gap-2 text-light-3">
              <ul className="flex items-center gap-4 text-light-3 list-none">
                <li className="flex items-center relative before:absolute before:-left-4 before:text-light-3 before:text-lg after:ml-1">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString($createdAt)} {/* Formatted creation date */}
                  </p>
                </li>
                <li className="flex items-center relative before:content-['•'] before:absolute before:-left-4 before:text-light-3 before:text-lg before:mr-1">
                  <p className="subtle-semibold lg:small-regular">{location}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Edit Button: Shown only if the current user is the post creator */}
        {isUserCreator && (
          <Link to={`/update-post/${$id}`}>
            <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
          </Link>
        )}
      </div>

      {/* Main Content Section: Contains the post caption, tags, and image */}
      <Link to={`/posts/${$id}`} >
        <div className="small-medium lg:base-medium py-5">
          <p> {/* Post caption text */}
            <ReadMore
              text={caption}
              initialVisibleChars={190}
              seeMoreLabel=" Show More"
              seeLessLabel=" Show Less"
              textClassName="text-base"
              toggleClassName="text-blue-500 font-bold cursor-pointer"
            />
          </p>

          {/* Tags List: Display tags associated with the post */}
          <div className="mt-2">
            {tags.map((tag: string) => (
              <span key={tag} className="text-light-3 mr-1">
                #{tag} {/* Each tag as a list item */}
              </span>
            ))}
          </div>
        </div>

        {/* Post Image: Fallback to placeholder if no image is provided */}
        <img
          src={imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="post-card_img"
          alt={caption}
        />
      </Link >

      {/* Post Statistics: Component to display likes, save posts etc. */}
      < PostStats post={post} userId={user.id} />
    </li >
  );
};

export default PostCard;

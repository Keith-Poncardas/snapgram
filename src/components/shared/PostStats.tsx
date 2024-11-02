import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  // Initialize likes array based on post data
  const initialLikes = post?.likes.map((user: Models.Document) => user.$id);
  const [likes, setLikes] = useState(initialLikes);

  // Track whether the post is saved by the current user
  const [isSaved, setIsSaved] = useState(false);

  // React Query hooks for mutation functions and states
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } = useDeleteSavedPost();

  // Fetch the current user data to check saved posts
  const { data: currentUser } = useGetCurrentUser();

  // Check if the post is already saved by the user, update `isSaved` state accordingly
  useEffect(() => {
    if (post && post.$id && currentUser?.save) {
      const isPostSaved = currentUser.save.some((record: Models.Document) => record.post?.$id === post.$id);
      setIsSaved(isPostSaved || false);
    }
  }, [currentUser, post]);


  /**
   * Handles the "like" functionality for the post.
   * If the post is already liked by the user, it will remove the like.
   * Otherwise, it will add the user's like and update the server.
   */
  const toggleLike = () => {
    if (!post?.$id) return; // Ensure post ID exists

    const hasLiked = likes.includes(userId);
    const updatedLikes = hasLiked ? likes.filter((id: string) => id !== userId) : [...likes, userId];

    setLikes(updatedLikes);
    likePost({ postId: post.$id, likesArray: updatedLikes });
  };

  /**
   * Handles the "save" functionality for the post.
   * If the post is already saved, it removes the save.
   * Otherwise, it saves the post to the user's saved list and updates the server.
   */
  const toggleSave = () => {
    if (!post?.$id || !currentUser) return; // Ensure post ID and current user data exist

    if (isSaved) {
      setIsSaved(false);
      const savedRecordId = currentUser.save.find((record: Models.Document) => record.post.$id === post.$id)?.$id;
      if (savedRecordId) deleteSavedPost(savedRecordId);
    } else {
      setIsSaved(true);
      savePost({ postId: post.$id, userId });
    }
  };

  /**
   * Renders the save icon with loading animation when saving or deleting.
   * The icon toggles between "saved" and "unsaved" based on the `isSaved` state.
   */
  const renderSaveIcon = () => {
    if (isSavingPost || isDeletingSaved) {
      return <PuffLoader color="#7C67FE" size={20} />;
    }
    const iconSrc = isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg";
    return (
      <img
        src={iconSrc}
        alt="save"
        width={20}
        height={20}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event from bubbling up
          toggleSave();
        }}
        className="cursor-pointer"
      />
    );
  };

  return (
    <div className="flex justify-between items-center z-20">
      {/* Likes section */}
      <div className="flex gap-2 mr-5">
        <img
          src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            toggleLike();
          }}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      {/* Save section with loader and toggle icon */}
      <div className="flex gap-2">{renderSaveIcon()}</div>
    </div>
  );
};

export default PostStats;

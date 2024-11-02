// Import necessary modules and components from external libraries and internal files
import { zodResolver } from "@hookform/resolvers/zod"; // Zod resolver for form validation
import { useForm } from "react-hook-form"; // Hook for managing form state
import { z } from "zod"; // Zod library for schema-based validation
import { Button } from "@/components/ui/button"; // UI button component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // UI form components for consistent form structure
import { Input } from "@/components/ui/input"; // UI input component
import { Textarea } from "../ui/textarea"; // UI textarea component
import FileUploader from "../shared/FileUploader"; // Component to handle file uploads
import { PostValidation } from "@/lib/validation"; // Validation schema for the post form
import { Models } from "appwrite"; // Type definition for data models from Appwrite
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations"; // Custom hook for post creation mutation
import { useNavigate } from "react-router-dom"; // Navigation hook for redirecting users
import { useToast } from "@/hooks/use-toast"; // Custom hook for displaying toast notifications
import { useUserContext } from "@/context/AuthContext"; // Custom hook for accessing user context
import { PulseLoader } from "react-spinners";

// Define prop types for the component for type safety and clarity
type PostFormProps = {
  post?: Models.Document; // Optional post object for editing an existing post
  action: "Create" | "Update";
};

// Main component for the post creation form
const PostForm = ({ post, action }: PostFormProps) => {

  // Initialize navigation and toast notification hooks
  const navigate = useNavigate(); // Allows redirection to different routes
  const { toast } = useToast(); // Displays success or error messages to the user
  const { user } = useUserContext(); // Access logged-in user data from context

  // Extract the async mutation function for creating a new post
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();

  //  Extract the async mutation function for updating a post
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  // Initialize the form with validation, default values, and error handling
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation), // Apply Zod schema validation to the form
    defaultValues: {
      caption: post?.caption || "", // Set default caption if editing an existing post
      file: [], // Initialize file input as an empty array
      location: post?.location || "", // Set default location if editing an existing post
      tags: post?.tags.join(',') || "", // Convert tags array to comma-separated string for input
    },
  });

  // Function to handle form submission for creating or updating a post
  const onSubmit = async (formData: z.infer<typeof PostValidation>) => {
    try {
      // Check if the action is to update an existing post
      if (post && action === "Update") {
        // Update the post with the provided form data
        const updatedPost = await updatePost({
          ...formData,             // Spread the form data
          postId: post.$id,        // Include the post ID for the update
          imageId: post?.imageId,  // Include the existing image ID
          imageUrl: post?.imageUrl  // Include the existing image URL
        });

        // Check if the update was successful
        if (!updatedPost) {
          toast({ title: "Please try again." }); // Notify user of failure
        } else {
          toast({ title: "Post edited successfully!" }); // Notify user of success
        }

        // Redirect to the homepage after updating
        return navigate(`/posts/${post.$id}`);
      }

      // Attempt to create a new post with the submitted form data and user ID
      const newPost = await createPost({ ...formData, userId: user.id });

      // Check if the post creation was successful
      if (newPost) {
        // Notify user of successful post creation
        toast({ title: "Post created successfully!" });
        // Redirect to the homepage after successful creation
        navigate("/");
      } else {
        // Display an error message if post creation fails
        toast({ title: "Create post failed. Please try again." });
      }
    } catch (error: any) {
      // Handle any unexpected errors during post creation or update
      console.error("Error creating post:", error);
      toast({ title: error.message }); // Notify user of the error message
    }
  };

  // Function to determine and display the loading state during post creation or update
  const renderSubmitButton = () => {
    // Check if either the post creation or update operation is currently loading
    if (isLoadingCreate || isLoadingUpdate) {
      // Return a loading spinner when a post is being created or updated
      return <PulseLoader
        color="white"
        size={7}
      />;
    }

    // Return a submit button text when not loading
    return (
      <span>{action} Post</span>
    );
  };

  return (
    // Wrap the form in a Form component to inherit form state and validation context
    <Form {...form}>
      {/* Form element to handle user input and submit data */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full">

        {/* Caption Input Field - Textarea to capture the post's caption */}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              {/* Display validation error message for caption input */}
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* File Uploader - Component to upload and display media files */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                {/* FileUploader component with onChange handler and optional existing media URL */}
                <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl} />
              </FormControl>
              {/* Display validation error message for file input */}
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Location Input Field - Input for specifying a location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              {/* Display validation error message for location input */}
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Tags Input Field - Input for adding comma-separated tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separated by commas)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="e.g., JavaScript, TypeScript, React"
                  {...field}
                />
              </FormControl>
              {/* Display validation error message for tags input */}
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Action Buttons - Submit and Cancel buttons for form actions */}
        <div className="flex gap-4 items-center justify-end">
          {/* Cancel button to navigate back without submitting */}
          <Button type="button" className="shad-button_dark_4" onClick={() => navigate("/")}>
            Cancel
          </Button>
          {/* Submit button to submit the form data */}
          <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoadingCreate || isLoadingUpdate}>
            {renderSubmitButton()}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;

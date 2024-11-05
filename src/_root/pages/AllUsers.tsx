// Import the UserCard component for displaying individual user information
import UserCard from "@/components/shared/UserCard";
import { AllUsersSkeleton } from "@/components/skeletons";

// Import the custom toast hook to show feedback messages to the user
import { toast } from "react-hot-toast";

// Import the custom hook for fetching user data using React Query
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";


// Define the AllUsers component
const AllUsers = () => {

  // Destructure the results of the `useGetUsers` hook:
  // - `data` is aliased as `creators`, representing the user data fetched from the API.
  // - `isLoading` is a boolean indicating if data is still loading.
  // - `isError` (renamed as `isErrorCreators`) flags any error that occurs during data fetching.
  const { data: creators, isLoading, isError: isErrorCreators } = useGetUsers();

  // Handle any errors that occur during the data fetch
  if (isErrorCreators) {
    // Show a toast notification if an error occurs
    toast.error("Something went wrong.");
    // Exit the function early as there’s nothing to render when there’s an error
    return;
  }

  return (
    // Main container for the component layout with standard styling
    <div className="common-container">
      {/* Sub-container for user-related content */}
      <div className="user-container">
        {/* Heading for the users list */}
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        {/* Conditional rendering based on loading status and data availability */}
        {isLoading && !creators ? (
          // Show a loading spinner in the center if data is still loading
          <AllUsersSkeleton />
        ) : (
          // Display the list of users once data is loaded
          <ul className="user-grid">
            {/* Map over the `creators` array to render each user */}
            {creators?.documents.map((creator) => (
              // Each user item is wrapped in an <li> with a unique key for React to track elements efficiently
              <li key={creator?.$id} className="flex-1 min-w-[200px] w-full">
                {/* Render the UserCard component for each user, passing the user data as props */}
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default AllUsers;

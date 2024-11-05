// Import necessary modules and hooks from React and other dependencies
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // For detecting when elements are in view
import useDebounce from "@/hooks/useDebounce"; // Custom debounce hook

// Import custom hooks for fetching posts data
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queriesAndMutations";

// Import spinner for loading indication
import { PuffLoader } from "react-spinners";

// Import components for displaying posts and search UI
import GridPostList from "@/components/shared/GridPostList";
import { Input } from "@/components/ui/input";
import SearchResults from "@/components/shared/SearchResults";
import { ExploreSkeleton } from "@/components/skeletons";

// Main component for exploring and searching posts
const Explore = () => {
  // Initialize intersection observer to detect if element is in view
  const { ref, inView } = useInView();

  // Destructure data and pagination methods from the custom hook for fetching posts
  const { data: posts, isPending: isPostFetching, fetchNextPage, hasNextPage } = useGetPosts();

  // State for storing the search input value
  const [searchValue, setSearchValue] = useState("");

  // Apply debounce to the search value to optimize search API calls
  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch search results based on debounced search input
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);

  // Effect to trigger loading of more posts when inView is true and no search value is present
  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage(); // Load the next page of posts
    }
  }, [inView, searchValue]);

  // Condition to check if search results should be displayed
  const shouldShowSearchResults = searchValue !== "";

  // Check if 'End of posts' message should be displayed
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts?.pages?.every((item: any) => item.documents.length === 0);


  return (
    <div className="explore-container">
      {/* Header for search functionality */}
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Search Posts</h2>

        {/* Search input with icon */}
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg" // Icon for search input
            width={24}                     // Fixed width for consistency
            height={24}                    // Fixed height for consistency
            alt="search"                   // Alt text for accessibility
          />
          <Input
            type="text"                    // Search input type
            placeholder="Search"           // Placeholder text for search input
            className="explore-search"     // Custom CSS class for styling
            value={searchValue}            // Bind search value state
            onChange={(e: any) => {        // Update state on input change
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>
      </div>

      {/* Section header for popular posts */}
      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">Popular Today</h3>

        {/* Filter button placeholder */}
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg" // Icon for filter button
            width={20}                     // Fixed width for consistency
            height={20}                    // Fixed height for consistency
            alt="filter"                   // Alt text for accessibility
          />
        </div>
      </div>

      {/* Main content section for displaying posts or search results */}
      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {/* Display search results if there is a search value */}
        {isPostFetching ? (
          <ExploreSkeleton />
        ) : shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts?.pages.map((item, index) => {
            if (item)
              return (
                <GridPostList key={`page-${index}`} posts={item.documents} showUser={true} showStats={true} />
              );
          })
        )}
      </div>

      {/* Infinite scroll loader - fetches next page if there's more and not in search mode */}
      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <PuffLoader color="white" />
        </div>
      )}
    </div>
  );
};

// Exporting the Explore component for use in other parts of the application
export default Explore;

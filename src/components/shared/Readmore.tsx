import React, { useState } from "react";

// Define the props for the ReadMore component using TypeScript interface
interface ReadMoreProps {
  text: string; // The text content to display
  initialVisibleChars?: number; // The number of characters to show initially
  seeMoreLabel?: string; // Label for the "See More" link
  seeLessLabel?: string; // Label for the "See Less" link
  textClassName?: string; // Custom class name for the text span
  toggleClassName?: string; // Custom class name for the toggle link
}

// Functional component for showing expandable text
export const ReadMore: React.FC<ReadMoreProps> = ({
  text,
  initialVisibleChars = 100, // Default value for initial visible characters
  seeMoreLabel = "See More", // Default label for "See More"
  seeLessLabel = "See Less", // Default label for "See Less"
  textClassName = "text-gray-700", // Default class for the text
  toggleClassName = "text-blue-500 font-semibold cursor-pointer hover:underline", // Default class for the toggle link
}) => {
  // State to manage the expansion of text
  const [expanded, setExpanded] = useState(false);

  // Function to toggle the expanded state
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to parent elements
    e.preventDefault(); // Prevent the default action of the click event (like following a link)
    setExpanded((prev) => !prev); // Toggle the expanded state
  };

  // Determine the text to display based on the expanded state
  const displayText =
    expanded
      ? text // Show full text if expanded
      : text.length > initialVisibleChars // Check if the text is longer than the initial visible characters
        ? `${text.slice(0, initialVisibleChars)}...` // Show truncated text with ellipsis
        : text; // If text is short enough, show it all

  return (
    <div className="space-y-2"> {/* Container with vertical spacing */}
      <span className={textClassName}>{displayText}</span> {/* Display the calculated text */}
      {/* Show the toggle link only if the text is longer than the initial visible characters */}
      {text.length > initialVisibleChars && (
        <span onClick={toggleExpanded} className={toggleClassName}>
          {expanded ? seeLessLabel : seeMoreLabel} {/* Toggle the label based on the expanded state */}
        </span>
      )}
    </div>
  );
};

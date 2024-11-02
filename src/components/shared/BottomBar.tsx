import { bottombarLinks } from '@/constants'; // Import link data from constants
import { INavLink } from '@/types'; // Import type for link interface
import { Link, useLocation } from 'react-router-dom'; // Import Link component and hook to get current route

// Component for the bottom navigation bar
const BottomBar = () => {
  const { pathname } = useLocation(); // Get the current path from the router

  return (
    <section className="bottom-bar"> {/* Container for bottom bar */}
      {bottombarLinks.map((link: INavLink) => { // Loop through each link item
        const isActive = pathname === link.route; // Check if the link is the active route

        return (
          <Link
            to={link.route} // Navigation path for each link
            key={link.label} // Unique key for each link based on label
            className={`flex-center flex-col gap-1 p-2 transition ${isActive ? 'bg-primary-500 rounded-[10px]' : ''
              }`} // Conditional styling for active link
          >
            {/* Display link icon */}
            <img
              src={link.imgURL} // Image source for the icon
              alt={`${link.label} icon`} // Descriptive alt text for accessibility
              className={isActive ? 'invert-white' : ''} // Conditional styling to invert color for active link
              width={16}
              height={16}
            />
            {/* Display link label text */}
            <p className="tiny-medium text-light-2">{link.label}</p>
          </Link>
        );
      })}
    </section>
  );
};

export default BottomBar;

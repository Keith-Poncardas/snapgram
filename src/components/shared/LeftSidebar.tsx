import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import { sidebarLinks } from "@/constants";
import { INavLink } from "@/types";

// Define the LeftSidebar component
const LeftSidebar = () => {

  // Get the current pathname from the location object
  const { pathname } = useLocation();

  // Destructure the mutate function as signOut and isSuccess from the useSignOutAccount hook
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  // Get the navigate function for programmatic navigation
  const navigate = useNavigate();

  // Destructure user and isLoading from the user context
  const { user } = useUserContext();

  // useEffect to navigate to the home page on successful sign-out
  useEffect(() => {
    if (isSuccess) {
      navigate(0); // Refresh the page
    }
  }, [isSuccess]);

  return (
    // Define the main navigation container with a flex column layout
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        {/* Link to the home page with the logo */}
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>

        {/* Link to the user's profile page */}
        <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={`${user.name}'s profile image`}
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>

        {/* Render the sidebar navigation links */}
        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            // Determine if the current path is active
            const isActive = pathname === link.route;
            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${isActive && 'bg-primary-500'}`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={`${link.label}`}
                    className={`group-hover:invert-white ${isActive && 'invert-white'}`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Render the logout button */}
      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={() => signOut()}
      >
        <img
          src="/assets/icons/logout.svg"
          alt="logout"
        />
        <p className="small-medium lg:base-medium">Logout</p>
      </Button>
    </nav>
  )
}

export default LeftSidebar;

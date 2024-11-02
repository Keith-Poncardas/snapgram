import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

// Define the Topbar component
const Topbar = () => {

  // Destructure the mutate function as signOut and isSuccess from the useSignOutAccount hook
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  // Get the navigate function for programmatic navigation
  const navigate = useNavigate();

  // Destructure user from the user context
  const { user } = useUserContext();

  // useEffect to navigate to the home page on successful sign-out
  useEffect(() => {
    if (isSuccess) {
      navigate(0); // Refresh the page
    }
  }, [isSuccess]);

  return (
    // Define the main topbar section with a flex layout
    <section className="topbar">
      <div className="flex-between py-4 px-5">

        {/* Link to the home page with the logo */}
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={130}
            height={325}
          />
        </Link>

        {/* Right side of the topbar with logout button and user profile link */}
        <div className="flex gap-4">

          {/* Button to sign out the user */}
          <Button variant="ghost" className="shad-button_ghost" onClick={() => signOut()}>
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
            />
          </Button>

          {/* Link to the user's profile page */}
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
              alt={`${user.name}'s profile image`}
              className="h-8 w-8 rounded-full"
            />
          </Link>

        </div>
      </div>
    </section>
  );
}

export default Topbar;

import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"

import { useToast } from "@/hooks/use-toast"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { SigninValidation } from "@/lib/validation"
import { z } from "zod"
import { useSignInAccount } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { PulseLoader } from "react-spinners"

// Define a functional component named SigninForm
const SigninForm = () => {

  // This is likely used to display notifications to the user
  const { toast } = useToast();

  // Used to programmatically navigate between different routes in your app
  const navigate = useNavigate();

  // This function is probably used to check if a user is authenticated
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // This function is used for signing in an existing user account
  const { mutateAsync: signInAccount } = useSignInAccount();

  // Initialize a form using the useForm hook with type inference from zod schema validation
  const form = useForm<z.infer<typeof SigninValidation>>({

    // Set up the resolver to use zod's resolver function for validation
    resolver: zodResolver(SigninValidation),

    // Define the default values for the form fields
    defaultValues: {
      email: '',          // Default value for the email field is an empty string
      password: ''        // Default value for the password field is an empty string
    },
  });

  // Define an asynchronous function named onSubmit that accepts a values parameter
  // inferred from the SignupValidation schema
  async function onSubmit(values: z.infer<typeof SigninValidation>) {

    // Sign in the new user account using the email and password from the provided values
    const session = await signInAccount({
      email: values.email,
      password: values.password
    })

    // If signing in fails, display an error toast notification
    if (!session) {
      return toast({ title: "Oops! Invalid Credentials. Please try again." });
    }

    // Check if the user is authenticated using the checkAuthUser function
    const isLoggedIn = await checkAuthUser();

    // If the user is authenticated
    if (isLoggedIn) {
      // Reset the form to its default values
      form.reset();

      // Navigate to the home page
      navigate('/');
    } else {
      // If authentication fails, display an error toast notification
      return toast({ title: "Sign in failed. Please try again." });
    }
  }

  // Render the form using the spread operator to apply all form properties
  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">

        {/* Display the logo image */}
        <img src="/assets/images/logo.svg" alt="logo" />

        {/* Display the form title */}
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log in to your account</h2>

        {/* Display the form description */}
        <p className="text-light-3 small-medium md:base-regular mt-10">Welcome back! Please enter your details</p>

        {/* Render the actual form with an onSubmit handler */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full mt-4">

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button type="submit" className="shad-button_primary">
            {isUserLoading ? (
              <div className="flex-center gap-2">
                <PulseLoader
                  color="white"
                  size={8}
                />
              </div>
            ) : 'Sign In'}
          </Button>

          {/* Display a message for users who already have an account */}
          <p className="text-small-regular text-light-2 text-center mt-2">
            New to Snapgram?
            <Link to="/sign-up" className="text-primary-500 text-sm-semibold ml-1">Create account</Link>
          </p>

        </form>
      </div>
    </Form>
  )
}

export default SigninForm


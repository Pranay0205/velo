import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { useMutation } from "@tanstack/react-query";
import AuthLayout from "@/components/ui/AuthLayout";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupForm = z.infer<typeof signupSchema>;

// Small, reusable Google Icon component to keep the main code clean
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      toast.success("Account created! Please log in.");
      logger.log("Signup response:", data);
      logger.log("Signup successful. Navigating to login page.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error("Signup failed. Please try again.");
      logger.error("Signup error:", error);
    },
  });

  const handleSignup = (data: SignupForm) => {
    mutate(data);
  };

  return (
    <AuthLayout>
      <div className="space-y-2 text-center lg:text-left">
        <div className="flex items-center justify-center gap-2 lg:justify-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Velo</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Get Started</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Create your account to start managing your daily engine.</p>
      </div>

      <form onSubmit={handleSubmit(handleSignup)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs uppercase tracking-widest text-zinc-500">
              First Name
            </Label>
            <Input id="name" placeholder="John" {...register("name")} className="bg-zinc-50/50 dark:bg-zinc-900/50" />
            {errors.name && <p className="text-[10px] font-medium text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-xs uppercase tracking-widest text-zinc-500">
              Last Name
            </Label>
            <Input
              id="last_name"
              placeholder="Doe"
              {...register("last_name")}
              className="bg-zinc-50/50 dark:bg-zinc-900/50"
            />
            {errors.last_name && <p className="text-[10px] font-medium text-red-500">{errors.last_name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-widest text-zinc-500">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            {...register("email")}
            className="bg-zinc-50/50 dark:bg-zinc-900/50"
          />
          {errors.email && <p className="text-[10px] font-medium text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs uppercase tracking-widest text-zinc-500">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className="bg-zinc-50/50 dark:bg-zinc-900/50"
          />
          {errors.password && <p className="text-[10px] font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-zinc-900 py-6 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full border-zinc-200 py-6 dark:border-zinc-800">
          <GoogleIcon />
          Sign up with Google
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

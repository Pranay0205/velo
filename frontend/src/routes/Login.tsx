import AuthLayout from "@/components/ui/AuthLayout";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

const loginScheme = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginForm = z.infer<typeof loginScheme>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginScheme),
  });

  const navigate = useNavigate();

  type LoginResponse = {
    email: string;
    name: string;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/login", {
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
    onSuccess: (data: LoginResponse) => {
      toast.success(`Welcome back, ${data.name}!`);
      logger.log("Login response:", data);
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error("Login failed. Please check your credentials and try again.");
      logger.error("Login error:", error);
    },
  });

  const handleLogin = (data: LoginForm) => {
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Login</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Log into your account to start using the Velo</p>
      </div>

      <form onSubmit={handleSubmit(handleLogin)} className="space-y-5 ">
        <div className="grid grid-rows-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-zinc-500">
              Email
            </Label>
            <Input
              id="email"
              placeholder="john@example.com"
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
              placeholder="********"
              {...register("password")}
              className="bg-zinc-50/50 dark:bg-zinc-900/50"
            />
            {errors.password && <p className="text-[10px] font-medium text-red-500">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-zinc-900 py-6 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "Logging in..." : "Log In"}
          </Button>
        </div>
      </form>
      <div>
        <p className="text-zinc-500 dark:text-zinc-400">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-zinc-950 underline underline-offset-4 dark:text-zinc-50">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

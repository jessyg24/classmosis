"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.name,
          school_name: data.school || null,
          role: "teacher",
          onboarding_completed: false,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-cm-section text-cm-text-primary">Create your account</h2>
        <p className="text-cm-body text-cm-text-secondary mt-1">
          Get your classroom set up in under 8 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            placeholder="Ms. Johnson"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-cm-caption text-cm-coral">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@school.edu"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-cm-caption text-cm-coral">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-cm-caption text-cm-coral">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">School name (optional)</Label>
          <Input
            id="school"
            placeholder="Taylor Elementary"
            {...register("school")}
          />
        </div>

        {error && (
          <p className="text-cm-caption text-cm-coral bg-cm-coral-light p-3 rounded-cm-button">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-cm-teal hover:bg-cm-teal-dark text-white rounded-cm-button"
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-cm-caption text-cm-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-cm-teal hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

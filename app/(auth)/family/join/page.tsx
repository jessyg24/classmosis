"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function FamilyJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cm-white flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-cm-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FamilyJoinContent />
    </Suspense>
  );
}

function FamilyJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: "", email: "", password: "" },
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-cm-white flex items-center justify-center p-6">
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border max-w-md w-full text-center">
          <h2 className="text-cm-section text-cm-text-primary mb-2">Invalid Link</h2>
          <p className="text-cm-body text-cm-text-secondary">
            This invite link is missing or invalid. Please ask your child&apos;s teacher for a new invite.
          </p>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/parent/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          invite_token: token,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      if (result.auto_login) {
        router.push("/family");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cm-white flex items-center justify-center p-6">
        <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border max-w-md w-full text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-cm-section text-cm-text-primary mb-2">Account Created!</h2>
          <p className="text-cm-body text-cm-text-secondary mb-4">
            Your account has been set up. You can now sign in to view your child&apos;s progress.
          </p>
          <Button onClick={() => router.push("/login")} className="bg-cm-purple hover:bg-cm-purple-dark text-white">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-white flex items-center justify-center p-6">
      <Card className="p-cm-8 bg-cm-surface rounded-cm-card border-cm-border max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-cm-section text-cm-purple">Family Portal</h2>
          <p className="text-cm-body text-cm-text-secondary mt-1">
            Create your account to view your child&apos;s progress
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-name">Your Name</Label>
            <Input id="join-name" {...register("name", { required: "Name is required" })} placeholder="Your full name" />
            {errors.name && <p className="text-cm-caption text-cm-coral">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-email">Email</Label>
            <Input id="join-email" type="email" {...register("email", { required: "Email is required" })} placeholder="your@email.com" />
            {errors.email && <p className="text-cm-caption text-cm-coral">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="join-password">Password</Label>
            <Input id="join-password" type="password" {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })} placeholder="At least 8 characters" />
            {errors.password && <p className="text-cm-caption text-cm-coral">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="text-cm-caption text-cm-coral bg-cm-coral-light p-3 rounded-cm-button">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-cm-purple hover:bg-cm-purple-dark text-white rounded-cm-button">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-cm-caption text-cm-text-secondary mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-cm-purple hover:underline font-medium">Sign in</a>
        </p>
      </Card>
    </div>
  );
}

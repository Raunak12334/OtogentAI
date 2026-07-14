"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Field,
    FieldLabel,
    FieldError,
    FieldContent,
} from "@/components/ui/field"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const router = useRouter();
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        await authClient.signIn.email({
            email: values.email,
            password: values.password,
            callbackURL: "/",
        }, {
            onSuccess: () => {
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
        });
    };

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Welcome Back
                    </CardTitle>
                    <CardDescription>
                        Login to Continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button variant="outline" className="w-full" type="button" disabled={isPending}>
                                    Continue with GitHub
                                </Button>
                                <Button variant="outline" className="w-full" type="button" disabled={isPending}>
                                    Continue with Google
                                </Button>
                            </div>
                            <div className="grid gap-6">
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...form.register("email")}
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel>Password</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="password"
                                            placeholder="******"
                                            {...form.register("password")}
                                        />
                                    </FieldContent>
                                </Field>
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    Login
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don't have an account?{" "}
                                <Link href="/signup" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

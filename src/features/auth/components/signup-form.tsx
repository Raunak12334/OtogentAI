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
    FieldDescription,
    FieldContent,
} from "@/components/ui/field"
import Link from "next/link"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"

const signupSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password don't match",
        path: ["confirmPassword"]
    })

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupForm = () => {
    const router = useRouter();
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        await authClient.signUp.email({
            name: values.email,
            email: values.email,
            password: values.password,
            callbackURL: "/",

        }, {
            onSuccess: () => {
                router.push("/");
            },
            onError: (ctx) => {
                toast.error(ctx.error.message);
            }
        });
    };

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        Create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-4">
                                <Button variant="outline" className="w-full" type="button" disabled={isPending}>
                                    <Image alt="Github" src="/github.svg" width={20} height={20} />
                                    Continue with GitHub
                                </Button>
                                <Button variant="outline" className="w-full" type="button" disabled={isPending}>
                                    <Image alt="Google" src="/google.svg" width={20} height={20} />
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
                                <Field>
                                    <FieldLabel>Confirm Password</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            type="password"
                                            placeholder="******"
                                            {...form.register("confirmPassword")}
                                        />
                                    </FieldContent>
                                </Field>
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    Sign up
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

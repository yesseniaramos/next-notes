'use client';
import{ useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { CardContent, CardFooter } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginAction, signUpAction } from '@/actions/users';

type Props = {
    type: "login" | "signUp";
};

function AuthForm({ type }: Props) {
    const isLoginForm = type === "login";
    const router = useRouter();

    //const {toast} = useToast();

    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) =>{
        console.log(isLoginForm);
        startTransition( async() => {
            const email = formData.get("email") as string;
            const password =formData.get("password") as string;
            let errorMessage;
            let title;
            let description;
            console.log(isLoginForm);
            if (isLoginForm) {
                errorMessage = (await loginAction(email, password)).errorMessage;
                title = "Logged in";
                description = "You have been successfully logged in.";

            }
            else {
                errorMessage = (await signUpAction(email, password)).errorMessage;
                console.log(errorMessage);
                title = "Sign Up";
                description = "Check your email for a confirmation link.";

            }

            if (!errorMessage){
                toast.success(title, { description });
                router.replace("/");
            } else {
                toast.error("Error", { description: errorMessage });
            }

        });
        console.log("form submitted");
    };

    return (
        <form action={ handleSubmit }>
            <CardContent className="grid gap-4">
                <div className ="flex flex-col space-y-1.5">
                    <Label htmlFor='email'>
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={ isPending }

                    />
                </div>
                <div className ="flex flex-col space-y-1.5">
                    <Label htmlFor='password'>
                        Password
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        disabled={ isPending }

                    />
                </div>
            </CardContent>
            <CardFooter className="mt-4 flex flex-col gap-6 ">
                <Button className="w-full">
                    {
                        isPending ? (
                            <Loader2 className='animate-spin' />
                        ) : (
                            isLoginForm ? ("Login") : ("Sign Up")
                        )
                    }
                </Button>
                <p className="text-xs">
                    { isLoginForm ? "Don't have an account yet" : "Already have an account?"}{" "}
                    <Link 
                        href={ isLoginForm ? "/sign-up" : "/login" }
                        className={`text-blue-500 underline ${isPending ? "pointer-events-none opacity-50" : "" }`}
                    >
                    { isLoginForm ? "Sign Up" : "Login" }
                    </Link>
                </p>
            </CardFooter>
        </form>
    )
}

export default AuthForm
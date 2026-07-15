import { LoginForm } from "@/features/auth/components/login-form";
import { requireUnauth } from "@/lib/auth-utils";


const Page = async () => {
    await requireUnauth();
    <LoginForm />

};

export default Page;


import { LoginForm } from "../../components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col gap-16 items-center justify-center">
      <h1 className=" text-3xl font-bold font-geologica">Stick With It!!!</h1>
      <div className="text-center ">
        <LoginForm />
        <p className="text-sm mt-2">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

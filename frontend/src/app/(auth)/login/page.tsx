import { LoginForm } from "../../components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className=" text-2xl font-bold font-geologica">Stick With It!!!</h1>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Login</h1>
        <LoginForm />
        <p className="text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

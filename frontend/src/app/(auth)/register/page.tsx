import { RegisterForm } from "../../components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className=" text-2xl font-bold font-geologica">Stick With It!!!</h1>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Register</h1>
        <RegisterForm />
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

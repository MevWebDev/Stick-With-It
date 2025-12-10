import { RegisterForm } from "../../components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col gap-16 items-center justify-center">
      <h1 className=" text-3xl font-bold font-geologica">Stick With It!!!</h1>
      <div className="text-center ">
        <RegisterForm />
      </div>
    </div>
  );
}

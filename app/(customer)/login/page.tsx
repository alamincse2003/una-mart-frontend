import { PageBanner } from "@/components/customer/PageBanner";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "@/components/customer/AuthForm";

export default function LoginPage() {
  return (
    <>
      <PageBanner title="Login" />
      <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <h2 className="text-xl font-bold text-neutral-800">
          Welcome to UNA Mart
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Login or create an account to track orders and check out faster.
        </p>
        <Card className="mt-6 p-6">
          <AuthForm />
        </Card>
      </section>
    </>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base text-text-base flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-7xl font-bold bg-gradient-to-r from-cyan-accent via-purple-400 to-cyan-accent bg-clip-text text-transparent">
          404
        </div>
        <p className="text-xl text-text-muted">Page not found</p>
        <p className="text-sm text-text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-cyan-accent text-black">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="border-base-color">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

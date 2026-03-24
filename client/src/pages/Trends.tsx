import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Trends() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container flex h-14 items-center gap-4">
          <Link href="/"><a className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /></a></Link>
          <h1 className="text-lg font-semibold">TRENDS</h1>
        </div>
      </header>
      <main className="container py-8">
        <p className="text-muted-foreground">Coming soon - Performance trends and insights</p>
      </main>
    </div>
  );
}

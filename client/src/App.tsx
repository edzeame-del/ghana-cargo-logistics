import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Tracking from "@/pages/tracking";
import NotFound from "@/pages/not-found";
import WhatsAppButton from "@/components/whatsapp-button";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="msg-theme">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/services" component={Services} />
              <Route path="/contact" component={Contact} />
              <Route path="/terms" component={Terms} />
              <Route path="/tracking" component={Tracking} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
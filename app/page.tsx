"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bitcoin, Github, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";
const features = [
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Real-time Visualization",
    description:
      "Watch blocks being mined and connected in real-time with smooth animations.",
  },
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Interactive Wallets",
    description: "Create and manage wallets, make transactions between them.",
  },
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Mining Simulation",
    description:
      "Experience the mining process with live nonce iterations and block creation.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Bitcoin className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">BlockchainX</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/simulator"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Simulator
              </Link>
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Link href="/simulator">
                <Button variant="outline">Launch App</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        {/* <section className="py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-white">Visualize & Learn</span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Blockchain
              </span>{" "}
              <span className="text-white">Technology</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Interactive blockchain simulator for developers, students, and
              enthusiasts. Create blocks, make transactions, and visualize the
              entire process in real-time.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/simulator">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  Try Simulator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </motion.div>
        </section> */}
        <section className="relative overflow-hidden py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 pb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">Visualize & Learn</span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Blockchain
              </span>{" "}
              <span className="text-foreground">Technology</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Interactive blockchain simulator for developers, students, and
              enthusiasts. Create blocks, make transactions, and visualize the
              entire process in real-time.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/simulator">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Try Simulator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-accent"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
          </motion.div>

          <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-xl p-4"
          >
              <Image
                src="https://i.ibb.co/Kxg95knq/Blockchain-X.png"
                alt="BlockX Interface"
                width={1200}
                height={600}
                className="rounded-lg border-2 border-solid border-indigo-600 bg-indigo-100"
                priority
              />
            </motion.div>

            <div className="absolute -left-32 bottom-20 animate-float-slow md:block hidden">
              <div className="rounded-lg bg-white/90 shadow-lg dark:bg-gray-800/90">
                <Image
                  src="https://i.ibb.co/CpwbC3ry/extra1.png"
                  alt="Decorative"
                  width={230}
                  height={260}
                  className="rounded-lg border-2 border-solid border-indigo-600 bg-indigo-100"
                />
              </div>
            </div>
            <div className="absolute -right-36 bottom-32 animate-float md:block hidden">
              <div className="rounded-lg bg-white/90 shadow-lg dark:bg-gray-800/90">
                <Image
                  src="https://i.ibb.co/1JtKmYpX/extra2.png"
                  alt="Decorative"
                  width={380}
                  height={180}
                  className="rounded-lg border-2 border-solid border-indigo-600 bg-indigo-100"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-white/10" id="features">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Features</h2>
              <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
                Everything you need to understand blockchain technology through
                interactive visualization.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <Card className="p-6 h-full bg-card hover:bg-accent transition-colors">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Built with ❤️ and ☕ by <a href="https://vandit-shah.me" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">Vandit Shah</a> |{" "}
              <a href="/" className="text-foreground hover:text-primary transition-colors">
                BlockchainX
              </a>
              . The source code is available on{" "}
              <a href="https://github.com/ShahVandit8" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                GitHub
              </a>
              .
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

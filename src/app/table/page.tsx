"use client";

import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Entry {
  id: number;
  name: string;
  cedula: string;
  telefono: string;
  direccion: string;
  salario: number;
  userEmail: string;
}

export default function DemoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [heatmapStyle, setHeatmapStyle] = useState({});
  const [showSignOut, setShowSignOut] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [color, setColor] = useState("#00563b");
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para mensajes de error

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/entries?userEmail=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched entries:", data);
          setEntries(data);
        })
        .catch((error) => console.error("Error fetching entries:", error));
    }
  }, [session]);

  const handleMouseMove = (e: any) => {
    const { clientX, clientY } = e;
    setHeatmapStyle({
      background: `radial-gradient(circle at ${clientX}px ${clientY}px, ${color}, transparent 3%)`,
    });
  };

  const handleMouseLeave = () => {
    setHeatmapStyle({
      background: 'none',
    });
  };

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.addEventListener("mousemove", handleMouseMove);
      navbar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        navbar.removeEventListener("mousemove", handleMouseMove);
        navbar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [color]);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#8b00ff"];

  useEffect(() => {
    const interval = setInterval(() => {
      setColor((prevColor) => {
        const currentIndex = colors.indexOf(prevColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        return colors[nextIndex];
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-gray-900 p-4 relative navbar">
        <div className="absolute top-0 left-0 w-full h-full" style={heatmapStyle}></div>
        <div className="flex justify-end space-x-4 relative z-10">
          <Link href="/table" className="text-white hover:text-gray-400">Shadcn Table</Link>
          <Link href="/data" className="text-white hover:text-gray-400">Data</Link>
          <div
            onMouseEnter={() => setShowSignOut(true)}
            onMouseLeave={() => setShowSignOut(false)}
            className="relative"
          >
            <Link href="" className="text-white hover:text-gray-400">Profile</Link>
            {showSignOut && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="absolute top-full mt-1 right-0 bg-gray-700 text-white py-1 px-3 rounded hover:bg-gray-500"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-gray-800 text-white">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Shadcn Table</h1>
        </div>
        <div className="container mx-auto py-10">
          <DataTable
            columns={columns}
            data={entries}
          />
        </div>
      </main>
    </div>
  );
}

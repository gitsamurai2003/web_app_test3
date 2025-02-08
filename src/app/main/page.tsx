"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const Main: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [heatmapStyle, setHeatmapStyle] = useState({});
  const [showSignOut, setShowSignOut] = useState(false);
  const [color, setColor] = useState("#00563b");

  const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#8b00ff"]; // Colores del arcoíris

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/"); // Redirigir a la página de inicio de sesión si no está autenticado
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You are not logged in.</p>;

  return (
    <div className="min-h-screen flex flex-col">
        <nav className="bg-gray-900 p-4 flex justify-between items-center relative navbar">
        <div className="absolute top-0 left-0 w-full h-full" style={heatmapStyle}></div>
        <div className="flex-1">
          <span className="text-white text-2xl"></span>
        </div>
        <div className="flex space-x-4 relative z-10">
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
        <span className="text-6xl font-bold">RAINBOW</span> 
        <span className="text-6xl font-light">DATA</span>
        {session && session.user ? (
          <>
            <p>Welcome, {session.user.email}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </div>
  );
};

export default Main;

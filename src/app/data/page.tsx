"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { downloadExcel } from '../excelUtils/excelUtils'; // Ajusta la ruta según donde hayas colocado el archivo
import styles from "./Data.module.css"; // Asegúrate de que la ruta sea correcta

interface Entry {
  id: number;
  name: string;
  cedula: string;
  telefono: string;
  direccion: string;
  salario: number;
  userEmail: string;
}

const DataPage: React.FC = () => {
  const [heatmapStyle, setHeatmapStyle] = useState({});
  const [sortOrder, setSortOrder] = useState("none");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showSignOut, setShowSignOut] = useState(false);
  const [color, setColor] = useState("#00563b");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("name");
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>(entries);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Estado para mensajes de error
  const [newEntry, setNewEntry] = useState<Entry>({
    id: Date.now(),
    name: "",
    cedula: "",
    telefono: "",
    direccion: "",
    salario: 0,
    userEmail: "",
  });
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

  useEffect(() => {
    if (session?.user?.email) {
      setNewEntry((prevEntry) => ({
        ...prevEntry,
        userEmail: session.user.email || "",
      }));
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
    const navbar = document.querySelector(`.${styles.navbar}`);
    if (navbar) {
      navbar.addEventListener("mousemove", handleMouseMove);
      navbar.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        navbar.removeEventListener("mousemove", handleMouseMove);
        navbar.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [color]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  
    if (query.trim() === "") {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter((entry) => {
        switch (searchCriteria) {
          case "name":
            return entry.name.toLowerCase().includes(query);
          case "cedula":
            return entry.cedula.toLowerCase().includes(query);
          case "telefono":
            return entry.telefono.toLowerCase().includes(query);
          case "direccion":
            return entry.direccion.toLowerCase().includes(query);
          case "salario":
            return entry.salario.toString().includes(query);
          default:
            return false;
        }
      });
      setFilteredEntries(filtered);
    }
  };
  
  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchCriteria(e.target.value);
  };
  
  
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
          setFilteredEntries(data); 
        })
        .catch((error) => console.error("Error fetching entries:", error));
    }
  }, [session]);

  function sanitizeData(entries: Entry[]): Omit<Entry, 'id' | 'userEmail'>[] {
    return entries.map(({ id, userEmail, ...rest }) => rest);
  }
  
  const handleDownload = () => {
    const sanitizedEntries = sanitizeData(entries);
    const sanitizedSortedEntries = sanitizeData(sortedEntries);
    downloadExcel(sanitizedEntries, sanitizedSortedEntries, mediana, promedio);  
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  
    let sorted;
    switch (e.target.value) {
      case "nombre_asc":
        sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nombre_desc":
        sorted = [...entries].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "salario_mayor":
        sorted = [...entries].sort((a, b) => b.salario - a.salario);
        break;
      case "salario_menor":
        sorted = [...entries].sort((a, b) => a.salario - b.salario);
        break;
      case "cedula_mayor":
        sorted = [...entries].sort((a, b) => parseInt(b.cedula) - parseInt(a.cedula));
        break;
      case "cedula_menor":
        sorted = [...entries].sort((a, b) => parseInt(a.cedula) - parseInt(b.cedula));
        break;
      default:
        sorted = entries;
        break;
    }
  
    setFilteredEntries(sorted);
  };
  
  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>You are not logged in.</p>;

  const validateName = (name: string) => {
    if (name.trim().length < 2 || name.trim().length > 50) {
      return "El nombre debe tener entre 2 y 50 caracteres.";
    }
  
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regex.test(name)) {
      return "El nombre solo puede contener letras y espacios.";
    }
  
    return null;
  };
  const validateCedula = (cedula: string) => {
    const regex = /^[0-9]{1,9}$/;
    return regex.test(cedula);
  };

  const validateTelefono = (telefono: string) => {
    const regex = /^\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return regex.test(telefono);
  };
  
  const validateAddress = (direccion: string) => {
    if (direccion.trim().length < 10 || direccion.trim().length > 100) {
      return "La dirección debe tener entre 10 y 100 caracteres.";
    }
  
    const regex = /^[a-zA-Z0-9\s,.-áéíóúÁÉÍÓÚñÑ]+$/;
    if (!regex.test(direccion)) {
      return "La dirección solo puede contener letras, números, espacios y los caracteres , . -";
    }
  
    return null;
  };
  const validateSalario = (salario: number) => {
    if (!salario) {
      return "El salario es un campo requerido.";
    }
  
    if (salario <= 0) {
      return "El salario debe ser un número positivo.";
    }
  
    const salarioMinimo = 50; 
    const salarioMaximo = 1000000; 
  
    if (salario < salarioMinimo || salario > salarioMaximo) {
      return `El salario debe estar entre ${salarioMinimo} y ${salarioMaximo}.`;
    }
  
    return null;
  };
  const handleAddEntry = async () => {
    setErrorMessage(null); 

    if (!newEntry.name || !newEntry.cedula || !newEntry.telefono || !newEntry.direccion || !newEntry.salario || !newEntry.userEmail) {
      setErrorMessage("Todos los campos son requeridos");
      return;
    }

    const nameError = validateName(newEntry.name);

    if (nameError) {
      setErrorMessage(nameError);
      return;
    }
    if (!validateCedula(newEntry.cedula)) {
      setErrorMessage("La cédula debe ser numérica y tener un máximo de 9 dígitos");
      return;
    }
    if(!validateTelefono(newEntry.telefono)) {
      setErrorMessage("El teléfono debe ser numérico, tener un formato válido e incluir prefijo por pais");
      return;
    }
    const addressError = validateAddress(newEntry.direccion);
    if (addressError) {
      setErrorMessage(addressError);
      return;
    }
    const salarioError = validateSalario(newEntry.salario);
    if (salarioError) {
      setErrorMessage(salarioError);
      return;
    }

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newEntry.name,
          cedula: newEntry.cedula,
          telefono: newEntry.telefono,
          direccion: newEntry.direccion,
          salario: newEntry.salario,
          userEmail: newEntry.userEmail,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al agregar la entrada");
      }
      const entry = await response.json();
      console.log("Added entry:", entry); // Log the added entry
      setEntries([...entries, entry]);
      setNewEntry({
        id: Date.now(),
        name: "",
        cedula: "",
        telefono: "",
        direccion: "",
        salario: 0,
        userEmail: session?.user?.email || "",
      });
      setIsFormVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setFilteredEntries(entries);
  }, [entries]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value,
    });
  };

  const sortedEntries = [...entries].sort((a, b) => b.salario - a.salario);

  const calcularPromedio = () => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.salario, 0);
    return total / entries.length;
  };

  const calcularMediana = () => {
    if (entries.length === 0) return 0;
    const salariosOrdenados = entries.map((entry) => entry.salario).sort((a, b) => a - b);
    const mitad = Math.floor(salariosOrdenados.length / 2);
    if (salariosOrdenados.length % 2 === 0) {
      return (salariosOrdenados[mitad - 1] + salariosOrdenados[mitad]) / 2;
    } else {
      return salariosOrdenados[mitad];
    }
  };

  const promedio = calcularPromedio();
  const mediana = calcularMediana();

  return (
    
      <div className="min-h-screen flex flex-col">
        <nav className="bg-gray-900 p-4 relative navbar">
          <div className="absolute top-0 left-0 w-full h-full" style={heatmapStyle}></div>
          <div className="flex justify-end space-x-4 relative z-10">
            <select
              value={searchCriteria}
              onChange={handleCriteriaChange}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="name">Nombre</option>
              <option value="cedula">Cédula</option>
              <option value="telefono">Teléfono</option>
              <option value="direccion">Dirección</option>
              <option value="salario">Salario</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-gray-700 text-white p-2 rounded"
            />
            <select
              value={sortOrder}
              onChange={handleSort}
              className="bg-gray-700 text-white p-2 rounded"
            >
              <option value="none">Ordenar</option>
              <option value="nombre_asc">Nombre (A-Z)</option>
              <option value="nombre_desc">Nombre (Z-A)</option>
              <option value="salario_mayor">Salario (Mayor a Menor)</option>
              <option value="salario_menor">Salario (Menor a Mayor)</option>
              <option value="cedula_mayor">Cédula (Mayor a Menor)</option>
              <option value="cedula_menor">Cédula (Menor a Mayor)</option>
            </select>
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
        <main className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-800 text-white">
        <div className="flex space-x-4 mt-4">
            <button className="bg-gray-700 p-2 rounded" onClick={handleDownload}>
              <img src="/icons8-ms-excel-50.png" alt="Excel Icon" />
            </button>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="bg-blue-700 text-white p-2 rounded"
            >
              {isFormVisible ? '-' : '+'}
            </button>
          </div>

          {isFormVisible && (
            <div className="flex flex-col space-y-2 mt-4 bg-gray-700 p-4 rounded">
              <input
                type="text"
                name="name"
                value={newEntry.name}
                onChange={handleInputChange}
                placeholder="Nombre"
                className="bg-gray-600 text-white p-2 rounded"
              />
              <input
                type="text"
                name="cedula"
                value={newEntry.cedula}
                onChange={handleInputChange}
                placeholder="Cédula"
                className="bg-gray-600 text-white p-2 rounded"
              />
              <input
                type="text"
                name="telefono"
                value={newEntry.telefono}
                onChange={handleInputChange}
                placeholder="Teléfono"
                className="bg-gray-600 text-white p-2 rounded"
              />
              <input
                type="text"
                name="direccion"
                value={newEntry.direccion}
                onChange={handleInputChange}
                placeholder="Dirección"
                className="bg-gray-600 text-white p-2 rounded"
              />
              <input
                type="number"
                name="salario"
                value={newEntry.salario}
                onChange={handleInputChange}
                placeholder="Salario"
                className="bg-gray-600 text-white p-2 rounded"
              />
              <button onClick={handleAddEntry} className="bg-green-700 text-white p-2 rounded">
                Agregar
              </button>
              {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            </div>
          )}
          <h2 className="text-2xl font-bold mt-8">Informacion de empleados</h2>
          <table className="w-full mt-4 bg-gray-700 rounded">
            <thead>
              <tr className="bg-gray-600">
                <th className="p-2">Nombre</th>
                <th className="p-2">Cédula</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Dirección</th>
                <th className="p-2">Salario</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-2">{entry.name}</td>
                  <td className="p-2">{entry.cedula}</td>
                  <td className="p-2">{entry.telefono}</td>
                  <td className="p-2">{entry.direccion}</td>
                  <td className="p-2">{entry.salario}$</td>
                </tr>
              ))}
            </tbody>
          </table>
    
          <h2 className="text-2xl font-bold mt-8">Mejores Salarios</h2>
          <table className="w-full mt-4 bg-gray-700 rounded">
            <thead>
              <tr className="bg-gray-600">
                <th className="p-2">Nombre</th>
                <th className="p-2">Cédula</th>
                <th className="p-2">Teléfono</th>
                <th className="p-2">Dirección</th>
                <th className="p-2">Salario</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-2">{entry.name}</td>
                  <td className="p-2">{entry.cedula}</td>
                  <td className="p-2">{entry.telefono}</td>
                  <td className="p-2">{entry.direccion}</td>
                  <td className="p-2">{entry.salario}$</td>
                </tr>
              ))}
            </tbody>
          </table>
    
          <div className="flex flex-wrap justify-around w-full mt-8">
            <div className="bg-gray-700 p-4 rounded mb-4">
              <h3 className="text-lg font-bold">Mediana de Salarios:</h3>
              <p>&#8594; {mediana.toFixed(2)}$</p>
            </div>
            <div className="bg-gray-700 p-4 rounded mb-4">
              <h3 className="text-lg font-bold">Promedio de Salarios:</h3>
              <p>&#8594; {promedio.toFixed(2)}$</p>
            </div>
          </div>
        </main>
      </div>
    );
};
export default DataPage;

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
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.heatmap} style={heatmapStyle}></div>
        <select
          value={searchCriteria}
          onChange={handleCriteriaChange}
          className={styles.searchCriteria}
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
          className={styles.searchInput}
        />
        <select
          value={sortOrder}
          onChange={handleSort}
          className={styles.sortOrder}
        >
          <option value="none">Ordenar</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
          <option value="salario_mayor">Salario (Mayor a Menor)</option>
          <option value="salario_menor">Salario (Menor a Mayor)</option>
          <option value="cedula_mayor">Cédula (Mayor a Menor)</option>
          <option value="cedula_menor">Cédula (Menor a Mayor)</option>
        </select>
        <div className={styles.navItems}>
        <Link href="/table">Shadcn Table</Link>
          <Link href="/data">Data</Link>
          <div onMouseEnter={() => setShowSignOut(true)} onMouseLeave={() => setShowSignOut(false)} className={styles.profileLink}>
            <Link href="">Profile</Link>
            {showSignOut && (
              <button onClick={() => signOut({ callbackUrl: "/" })} className={styles.signOutButton}>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className={styles.mainContent}>
      <button className={styles.button1} onClick={handleDownload}>
        <img src="/icons8-ms-excel-50.png" alt="Excel Icon" />
      </button>
        <button onClick={() => setIsFormVisible(!isFormVisible)} className={styles.addButton}>
          {isFormVisible ? '-' : '+'}
        </button>
        {isFormVisible && (
          <div className={styles.newEntryForm}>
            <input type="text" name="name" value={newEntry.name} onChange={handleInputChange} placeholder="Nombre" />
            <input type="text" name="cedula" value={newEntry.cedula} onChange={handleInputChange} placeholder="Cédula" />
            <input type="text" name="telefono" value={newEntry.telefono} onChange={handleInputChange} placeholder="Teléfono" />
            <input type="text" name="direccion" value={newEntry.direccion} onChange={handleInputChange} placeholder="Dirección" />
            <input type="number" name="salario" value={newEntry.salario} onChange={handleInputChange} placeholder="Salario" />
            <button onClick={handleAddEntry} className={styles.addButton1}>Agregar</button>
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          </div>
        )}
        <h2 className={styles.title}>Informacion de empleados</h2>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Salario</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.name}</td>
                <td>{entry.cedula}</td>
                <td>{entry.telefono}</td>
                <td>{entry.direccion}</td>
                <td>{entry.salario}$</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className={styles.title}>Mejores Salarios</h2>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Salario</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.name}</td>
                <td>{entry.cedula}</td>
                <td>{entry.telefono}</td>
                <td>{entry.direccion}</td>
                <td>{entry.salario}$</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <h3 className={styles.title}>Mediana de Salarios:</h3><p className={styles.dataTable}>&#8594; {mediana.toFixed(2)}$</p>
          </div>
          <div className={styles.statBox}>
            <h3 className={styles.title}>Promedio de Salarios:</h3><p className={styles.dataTable}>&#8594; {promedio.toFixed(2)}$</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataPage;
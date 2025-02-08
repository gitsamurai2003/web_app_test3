"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
    id: number;
    name: string;
    cedula: string;
    telefono: string;
    direccion: string;
    salario: number;
    userEmail: string;
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "cedula",
    header: "Cedula",
  },
  {
    accessorKey: "telefono",
    header: "Telefono",
  },
  {
    accessorKey: "direccion",
    header: "Direccion",
  },
  {
    accessorKey: "salario",
    header: "Salario",
  },
]

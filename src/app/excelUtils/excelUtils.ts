import * as XLSX from 'xlsx';

export function downloadExcel(entries: any[], sortedEntries: any[], mediana: number, promedio: number) {
  const workbook = XLSX.utils.book_new();

  const worksheetEntries = XLSX.utils.json_to_sheet(entries);
  XLSX.utils.book_append_sheet(workbook, worksheetEntries, "Informacion de empleados");

  const worksheetSortedEntries = XLSX.utils.json_to_sheet(sortedEntries);
  XLSX.utils.book_append_sheet(workbook, worksheetSortedEntries, "Mejores Salarios");

  const statsData = [
    { Metric: 'Mediana de Salarios', Value: `${mediana.toFixed(2)}$` },
    { Metric: 'Promedio de Salarios', Value: `${promedio.toFixed(2)}$` }
  ];
  const worksheetStats = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, worksheetStats, "Calculos de mediana y promedio");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'employees_data.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

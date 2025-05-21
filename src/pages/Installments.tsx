
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Transaction } from "@/types";
import { InstallmentsList } from "@/components/installments/InstallmentsList";
import { InstallmentsSummary } from "@/components/installments/InstallmentsSummary";
import { InstallmentsFilters } from "@/components/installments/InstallmentsFilters";

// Mock transactions with installments for demonstration
const mockInstallments: Transaction[] = [
  {
    id: "1",
    type: "expense",
    amount: 299.90,
    date: "2023-06-01",
    description: "Smartphone",
    category: "2",
    installment: {
      current: 3,
      total: 12,
    },
  },
  {
    id: "2",
    type: "expense",
    amount: 200.0,
    date: "2023-06-05",
    description: "Notebook",
    category: "3",
    installment: {
      current: 6,
      total: 10,
    },
  },
  {
    id: "3",
    type: "expense",
    amount: 150.0,
    date: "2023-06-15",
    description: "TV 4K",
    category: "2",
    installment: {
      current: 2,
      total: 6,
    },
  },
  {
    id: "4",
    type: "expense",
    amount: 89.9,
    date: "2023-07-01",
    description: "Monitor",
    category: "3",
    installment: {
      current: 1,
      total: 5,
    },
  },
  {
    id: "5",
    type: "expense",
    amount: 399.0,
    date: "2023-07-10",
    description: "Geladeira",
    category: "2",
    installment: {
      current: 4,
      total: 15,
    },
  },
];

export default function Installments() {
  const [installments, setInstallments] = useState<Transaction[]>(mockInstallments);
  const [filters, setFilters] = useState({
    category: "all",
    startDate: "",
    endDate: "",
    search: "",
    status: "all", // all, active, completed
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Apply filters to transactions
  const filteredInstallments = installments.filter((transaction) => {
    // Status filter (active, completed, all)
    if (filters.status === "active" && transaction.installment && 
        transaction.installment.current >= transaction.installment.total) {
      return false;
    }
    if (filters.status === "completed" && transaction.installment && 
        transaction.installment.current < transaction.installment.total) {
      return false;
    }
    
    // Category filter
    if (filters.category !== "all" && transaction.category !== filters.category) {
      return false;
    }
    
    // Text search (description)
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Date filter
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Controle de Parcelas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas compras parceladas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InstallmentsFilters onFilterChange={handleFilterChange} />
            <InstallmentsList installments={filteredInstallments} />
          </div>
          <div>
            <InstallmentsSummary installments={installments} />
          </div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}

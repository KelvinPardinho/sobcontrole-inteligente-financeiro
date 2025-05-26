
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Transaction } from "@/types";
import { InstallmentsList } from "@/components/installments/InstallmentsList";
import { InstallmentsSummary } from "@/components/installments/InstallmentsSummary";
import { InstallmentsFilters } from "@/components/installments/InstallmentsFilters";
import { useInstallments } from "@/hooks/useInstallments";

export default function Installments() {
  const { installments, isLoading, markInstallmentAsPaid } = useInstallments();
  const [filters, setFilters] = useState({
    category: "all",
    startDate: "",
    endDate: "",
    search: "",
    status: "all", // all, active, completed, paid, unpaid
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Apply filters to transactions
  const filteredInstallments = installments.filter((transaction) => {
    // Status filter (active, completed, paid, unpaid, all)
    if (filters.status === "active" && transaction.installment && 
        transaction.installment.current >= transaction.installment.total) {
      return false;
    }
    if (filters.status === "completed" && transaction.installment && 
        transaction.installment.current < transaction.installment.total) {
      return false;
    }
    if (filters.status === "paid" && (!transaction.installment?.paid)) {
      return false;
    }
    if (filters.status === "unpaid" && transaction.installment?.paid) {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Controle de Parcelas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas compras parceladas e controle os pagamentos mensais</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sob-blue"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filtros */}
            <InstallmentsFilters onFilterChange={handleFilterChange} />
            
            {/* Tabela principal - ocupa toda a largura */}
            <div className="bg-white rounded-lg shadow-sm">
              <InstallmentsList 
                installments={filteredInstallments} 
                onMarkAsPaid={markInstallmentAsPaid}
              />
            </div>
            
            {/* Resumo e gráficos abaixo da tabela */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="lg:col-span-2 xl:col-span-3">
                <InstallmentsSummary installments={installments} />
              </div>
            </div>
          </div>
        )}
      </main>
      
      <FooterSection />
    </div>
  );
}

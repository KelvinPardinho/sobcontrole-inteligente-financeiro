
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Account } from "@/types";
import { AccountList } from "@/components/accounts/AccountList";
import { AccountForm } from "@/components/accounts/AccountForm";
import { useAccounts } from "@/hooks/useAccounts";

export default function Accounts() {
  const { accounts, isLoading, addAccount } = useAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAccount = async (data: Omit<Account, "id">) => {
    await addAccount(data);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Contas e Cartões</h1>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sob-blue hover:bg-sob-blue/90">
                  <Plus className="mr-2 h-4 w-4" /> Nova Conta/Cartão
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <AccountForm onSubmit={handleAddAccount} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sob-blue"></div>
          </div>
        ) : (
          <AccountList accounts={accounts} />
        )}
      </main>
      
      <FooterSection />
    </div>
  );
}

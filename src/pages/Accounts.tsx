
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Account, AccountType } from "@/types";
import { AccountList } from "@/components/accounts/AccountList";
import { AccountForm } from "@/components/accounts/AccountForm";

// Mock accounts for demonstration
const mockAccounts: Account[] = [
  {
    id: "1",
    name: "Itaú Checking",
    type: "checking",
    lastFourDigits: "4321",
    color: "#EC7000",
    balance: 3580.45
  },
  {
    id: "2",
    name: "Nubank",
    type: "checking",
    lastFourDigits: "8765",
    color: "#8A05BE",
    balance: 1290.78
  },
  {
    id: "3",
    name: "Bradesco Credit Card",
    type: "credit_card",
    lastFourDigits: "9012",
    color: "#CC092F",
    limit: 5000,
    dueDay: 10,
    closingDay: 2
  },
  {
    id: "4",
    name: "Credicard",
    type: "credit_card",
    lastFourDigits: "6543",
    color: "#003478",
    limit: 3500,
    dueDay: 15,
    closingDay: 8
  }
];

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddAccount = (data: Omit<Account, "id">) => {
    const newAccount: Account = {
      id: `${accounts.length + 1}`,
      ...data
    };

    setAccounts([...accounts, newAccount]);
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

        <AccountList accounts={accounts} />
      </main>
      
      <FooterSection />
    </div>
  );
}

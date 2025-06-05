
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalForm } from "@/components/GoalForm";
import { GoalCard } from "@/components/GoalCard";
import { useGoals } from "@/hooks/useGoals";
import { Skeleton } from "@/components/ui/skeleton";

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { goals, isLoading, createGoal, updateGoal, deleteGoal, isCreating } = useGoals();

  const handleAddGoal = (data: any) => {
    createGoal(data);
    setIsDialogOpen(false);
  };

  const handleUpdateProgress = (goalId: string, newAmount: number) => {
    updateGoal({
      id: goalId,
      updates: { current_amount: newAmount }
    });
  };

  const handleToggleComplete = (goalId: string, isCompleted: boolean) => {
    updateGoal({
      id: goalId,
      updates: { 
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }
    });
  };

  const savingsGoals = goals.filter(goal => goal.type === "savings");
  const expenseGoals = goals.filter(goal => goal.type === "expense");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainNav />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Metas e Alertas</h1>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" /> Nova Meta
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Metas e Alertas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sob-blue hover:bg-sob-blue/90">
                <Plus className="mr-2 h-4 w-4" /> Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <GoalForm onSubmit={handleAddGoal} isLoading={isCreating} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3 mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="savings">Economia</TabsTrigger>
            <TabsTrigger value="expense">Gastos</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma meta cadastrada ainda.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Crie sua primeira meta para começar a acompanhar seus objetivos financeiros.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={deleteGoal}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="savings">
            {savingsGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma meta de economia cadastrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savingsGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={deleteGoal}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expense">
            {expenseGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma meta de gastos cadastrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenseGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={deleteGoal}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <FooterSection />
    </div>
  );
}

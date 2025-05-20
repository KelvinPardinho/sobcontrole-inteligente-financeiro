
import { useState } from "react";
import { MainNav } from "@/components/MainNav";
import { FooterSection } from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalForm } from "@/components/GoalForm";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface Goal {
  id: string;
  name: string;
  category: string;
  limit: number;
  spent: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  notifyAt: number; // % do limite para alertar
}

// Mock data para demonstração
const mockGoals: Goal[] = [
  {
    id: "1",
    name: "Alimentação",
    category: "1",
    limit: 800,
    spent: 650,
    period: "monthly",
    notifyAt: 80,
  },
  {
    id: "2",
    name: "Transporte",
    category: "2",
    limit: 300,
    spent: 290,
    period: "monthly",
    notifyAt: 80,
  },
  {
    id: "3",
    name: "Lazer",
    category: "5",
    limit: 400,
    spent: 250,
    period: "monthly",
    notifyAt: 80,
  }
];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddGoal = (data: any) => {
    const newGoal: Goal = {
      id: `${goals.length + 1}`,
      name: data.name,
      category: data.category,
      limit: data.limit,
      spent: 0,
      period: data.period,
      notifyAt: data.notifyAt,
    };

    setGoals([...goals, newGoal]);
    setIsDialogOpen(false);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

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
            <DialogContent className="sm:max-w-lg">
              <GoalForm onSubmit={handleAddGoal} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = (goal.spent / goal.limit) * 100;
            const isOverLimit = percentage >= 100;
            const isNearLimit = percentage >= goal.notifyAt && !isOverLimit;
            
            return (
              <Card key={goal.id} className={`
                ${isOverLimit ? 'border-red-500 shadow-red-100/50' : ''} 
                ${isNearLimit ? 'border-yellow-500 shadow-yellow-100/50' : ''}
              `}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <CardDescription>
                    Meta {goal.period === "monthly" ? "mensal" : 
                          goal.period === "weekly" ? "semanal" : 
                          goal.period === "daily" ? "diária" : "anual"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Gasto:</span>
                      <span className="font-medium">{formatCurrency(goal.spent)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Limite:</span>
                      <span className="font-medium">{formatCurrency(goal.limit)}</span>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      indicatorClassName={getProgressColor(goal.spent, goal.limit)}
                    />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span 
                        className={`${isOverLimit ? 'text-red-500 font-medium' : 
                                     isNearLimit ? 'text-yellow-500 font-medium' : 
                                     'text-muted-foreground'}`}
                      >
                        {isOverLimit 
                          ? 'Limite excedido!' 
                          : isNearLimit 
                            ? 'Próximo do limite!' 
                            : 'Dentro do orçamento'}
                      </span>
                      <span className="font-medium">
                        {formatPercentage(percentage)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}

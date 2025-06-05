
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trash2, TrendingUp, Target } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Goal } from "@/hooks/useGoals";

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, newAmount: number) => void;
  onDelete: (goalId: string) => void;
  onToggleComplete: (goalId: string, isCompleted: boolean) => void;
}

export function GoalCard({ goal, onUpdateProgress, onDelete, onToggleComplete }: GoalCardProps) {
  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isNearTarget = percentage >= goal.notify_at && !goal.is_completed;
  const isOverTarget = percentage >= 100;
  
  const getProgressColor = () => {
    if (goal.type === "savings") {
      if (percentage < 50) return "bg-blue-500";
      if (percentage < 80) return "bg-green-500";
      return "bg-emerald-500";
    } else {
      if (percentage < 50) return "bg-green-500";
      if (percentage < 80) return "bg-yellow-500";
      return "bg-red-500";
    }
  };

  const getStatusColor = () => {
    if (goal.is_completed) return "text-green-600";
    if (goal.type === "expense" && isOverTarget) return "text-red-600";
    if (isNearTarget) return "text-yellow-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (goal.is_completed) return "Concluída";
    if (goal.type === "expense" && isOverTarget) return "Limite excedido!";
    if (goal.type === "savings" && isOverTarget) return "Meta atingida!";
    if (isNearTarget) return "Próximo do limite!";
    return "Em progresso";
  };

  const handleProgressUpdate = () => {
    const newAmount = prompt(`Digite o novo valor para "${goal.name}":`, goal.current_amount.toString());
    if (newAmount !== null && !isNaN(Number(newAmount))) {
      onUpdateProgress(goal.id, Number(newAmount));
    }
  };

  return (
    <Card className={`${
      goal.is_completed ? 'border-green-500 shadow-green-100/50' : 
      goal.type === "expense" && isOverTarget ? 'border-red-500 shadow-red-100/50' : 
      isNearTarget ? 'border-yellow-500 shadow-yellow-100/50' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {goal.type === "savings" ? <TrendingUp className="h-5 w-5 text-blue-500" /> : <Target className="h-5 w-5 text-orange-500" />}
            <div>
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={goal.type === "savings" ? "default" : "secondary"}>
              {goal.type === "savings" ? "Economia" : "Limite"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {goal.categories && (
            <div className="text-sm text-muted-foreground">
              Categoria: <span style={{ color: goal.categories.color }}>{goal.categories.name}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {goal.type === "savings" ? "Valor atual:" : "Gasto atual:"}
            </span>
            <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {goal.type === "savings" ? "Meta:" : "Limite:"}
            </span>
            <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
          </div>
          
          <Progress 
            value={percentage} 
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
          
          <div className="flex justify-between items-center text-sm">
            <span className={getStatusColor()}>
              {getStatusText()}
            </span>
            <span className="font-medium">
              {formatPercentage(percentage)}
            </span>
          </div>
          
          {goal.target_date && (
            <div className="text-sm text-muted-foreground">
              Meta para: {format(new Date(goal.target_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProgressUpdate}
              className="flex-1"
            >
              Atualizar Progresso
            </Button>
            
            {goal.type === "savings" && (
              <Button
                variant={goal.is_completed ? "secondary" : "default"}
                size="sm"
                onClick={() => onToggleComplete(goal.id, !goal.is_completed)}
                className="flex items-center gap-1"
              >
                {goal.is_completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {goal.is_completed ? "Desmarcar" : "Concluir"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

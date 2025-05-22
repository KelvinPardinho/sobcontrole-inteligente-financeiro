
import { useState } from "react";
import { format, setMonth, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Transaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDayTransactionsSummary } from "./CalendarUtils";

interface CalendarYearViewProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  transactions: Transaction[];
}

export function CalendarYearView({
  currentDate,
  onDateSelect,
  selectedDate,
  transactions
}: CalendarYearViewProps) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = setMonth(currentDate, i);
    return {
      name: format(date, "MMM"),
      date: date,
      days: eachDayOfInterval({
        start: startOfMonth(date),
        end: endOfMonth(date)
      })
    };
  });

  const handleMonthClick = (date: Date) => {
    onDateSelect(date);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {months.map((month) => {
        // Calculate total income and expense for the month
        const monthTransactions = transactions.filter(
          t => new Date(t.date).getMonth() === month.date.getMonth() &&
               new Date(t.date).getFullYear() === month.date.getFullYear()
        );
        
        const income = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        
        const total = income - expense;
        const isPositive = total >= 0;
        
        return (
          <Card 
            key={month.name} 
            className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
              month.date.getMonth() === selectedDate?.getMonth() && month.date.getFullYear() === selectedDate?.getFullYear()
                ? "ring-2 ring-sob-blue"
                : ""
            }`}
            onClick={() => handleMonthClick(month.date)}
          >
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium">{month.name}</h3>
              <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center text-gray-500">{day}</div>
              ))}
              
              {/* Empty days before start of month */}
              {Array.from({ length: month.days[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-2 w-2"></div>
              ))}
              
              {month.days.map((day) => {
                const { total } = getDayTransactionsSummary(transactions, day);
                return (
                  <div 
                    key={day.toString()}
                    className={`h-2 w-2 rounded-full mx-auto ${
                      total > 0 
                        ? 'bg-green-400' 
                        : total < 0 
                        ? 'bg-red-400' 
                        : 'bg-gray-200'
                    }`}
                  ></div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

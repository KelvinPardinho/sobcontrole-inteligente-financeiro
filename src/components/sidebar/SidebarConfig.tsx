
import { Calendar, CreditCard, HelpCircle, Home, MessageSquare, PieChart, Settings, User, Wallet, CreditCard as CreditCardIcon } from "lucide-react";

// Dashboard menu items configuration
export const dashboardItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Home />,
  }
];

// Finance tools menu items configuration
export const financeItems = [
  {
    title: "Transações",
    path: "/transactions",
    icon: <CreditCard />,
    subItems: [
      {
        title: "Receitas",
        path: "/transactions?type=income",
      },
      {
        title: "Despesas",
        path: "/transactions?type=expense",
      },
      {
        title: "Nova Transação",
        path: "/transactions/new",
      }
    ],
  },
  {
    title: "Parcelas",
    path: "/installments",
    icon: <CreditCardIcon />,
  },
  {
    title: "Contas e Cartões",
    path: "/accounts",
    icon: <Wallet />,
  },
  {
    title: "Calendário Financeiro",
    path: "/calendar",
    icon: <Calendar />,
  },
  {
    title: "Relatórios",
    path: "/reports",
    icon: <PieChart />,
    subItems: [
      {
        title: "Mensal",
        path: "/reports?type=monthly",
      },
      {
        title: "Categorias",
        path: "/reports?type=category",
      },
      {
        title: "Comparação",
        path: "/reports?type=comparison",
      }
    ],
  },
  {
    title: "Metas",
    path: "/goals",
    icon: <Settings />,
  },
  {
    title: "Importar",
    path: "/import",
    icon: <Settings />,
  }
];

// Account menu items configuration
export const accountItems = [
  {
    title: "Perfil",
    path: "/profile",
    icon: <User />,
  },
  {
    title: "Configurações",
    path: "/settings",
    icon: <Settings />,
  }
];

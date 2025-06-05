
import { CreditCard, Home, PieChart, Settings, User, Wallet, CreditCard as CreditCardIcon, Target } from "lucide-react";

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
    title: "Relatórios",
    path: "/reports",
    icon: <PieChart />,
  },
  {
    title: "Metas",
    path: "/goals",
    icon: <Target />,
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


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirecionamos para a Landing page por padrão
  useEffect(() => {
    // Se o usuário estiver autenticado, poderia redirecionar para o dashboard
    // Por enquanto, vamos apenas mostrar a landing
    // Se tivesse autenticação: navigate('/dashboard');
  }, [navigate]);

  return <Landing />;
};

export default Index;

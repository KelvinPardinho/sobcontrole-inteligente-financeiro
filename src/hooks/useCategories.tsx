
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCategories = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; color: string, icon?: string }[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<string, { name: string, color: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchCategories();
    }
  }, [session]);
  
  const fetchCategories = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, color, icon')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      
      if (data) {
        setCategories(data);
        
        const newCategoriesMap: Record<string, { name: string, color: string }> = {};
        data.forEach(category => {
          newCategoriesMap[category.id] = {
            name: category.name,
            color: category.color
          };
        });
        setCategoriesMap(newCategoriesMap);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    return categoriesMap[categoryId]?.name || "Outros";
  };
  
  const getCategoryColor = (categoryId: string): string => {
    return categoriesMap[categoryId]?.color || "#8E9196";
  };

  return {
    categories,
    categoriesMap,
    isLoading,
    getCategoryName,
    getCategoryColor,
    fetchCategories
  };
};
